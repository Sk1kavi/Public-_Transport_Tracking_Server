const User = require("../models/User");
const Bus = require("../models/Bus");
const webpush = require("web-push");
const cron = require("node-cron");

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  "mailto:sk1kavi499@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// 🔹 Helper: Calculate distance (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in km
}

// 🔹 Send push notification
async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    console.error("❌ Push notification error:", err.body || err.message);
  }
}

// 1️⃣ Save push subscription
exports.saveSubscription = async (req, res) => {
  try {
    const { userId, subscription } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.pushSubscription = subscription;
    await user.save();

    res.json({ message: "Push subscription saved ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2️⃣ Add bus notification preference
exports.addNotification = async (req, res) => {
  try {
    const { userId, busId, stopLocation, type, time } = req.body;

    const user = await User.findById(userId);
    const bus = await Bus.findById(busId);
    if (!user || !bus) return res.status(404).json({ error: "User or Bus not found" });

    user.notifications.push({
      busId,
      stopLocation,
      type, // "one-time" or "daily"
      time, // only used for daily
    });

    await user.save();
    res.json({ message: "Notification preference saved ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3️⃣ Check bus proximity & send notifications
async function checkBusProximity(busId) {
  const bus = await Bus.findById(busId);
  if (!bus) return;

  const users = await User.find({
    "notifications.busId": busId,
    pushSubscription: { $ne: null },
  });

  for (let user of users) {
    for (let notif of user.notifications) {
      const [stopLng, stopLat] = notif.stopLocation.coordinates;
      const [busLng, busLat] = bus.location.coordinates;

      const distance = getDistance(stopLat, stopLng, busLat, busLng);

      if (distance <= 0.3) { // notify if within 300m
        await sendPushNotification(user.pushSubscription, {
          title: `🚍 Bus ${bus.busNumber} is near`,
          body: `Your bus is ${Math.round(distance * 1000)} meters away from your stop.`,
        });

        // Remove one-time notifications after sending
        if (notif.type === "one-time") {
          user.notifications = user.notifications.filter(
            n => n._id.toString() !== notif._id.toString()
          );
          await user.save();
        }
      }
    }
  }
}

// 4️⃣ Polling function for active buses
exports.pollBusProximity = async (busId) => {
  const interval = setInterval(async () => {
    const bus = await Bus.findById(busId);
    if (!bus) return clearInterval(interval);
    await checkBusProximity(busId);
  }, 30000); // every 30s
};

// 5️⃣ Daily notification scheduler (runs every minute)
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5); // HH:mm

  const users = await User.find({
    "notifications.type": "daily",
    pushSubscription: { $ne: null },
  });

  for (let user of users) {
    for (let notif of user.notifications) {
      if (notif.type === "daily" && notif.time === timeStr) {
        await checkBusProximity(notif.busId);
      }
    }
  }
});
