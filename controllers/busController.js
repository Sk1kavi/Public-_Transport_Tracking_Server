const Bus = require("../models/Bus");
const User = require("../models/User");

// Get buses by route
exports.getBuses = async (req, res) => {
  try {
    const { source, destination } = req.query;
    const buses = await Bus.find({ source, destination, isActive: true });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBusById = async (req, res) => {
  try {
    const { busId } = req.params;
    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({ error: "Bus not found" });
    }

    res.json(bus); // send full bus document including stops & location
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBusLocation = async (req, res) => {
  try {
    console.log("🚌 updateBusLocation route called");  // to confirm route is hit

    const { busId, lat, lng, speed, timestamp } = req.body;
    console.log("Request body:", req.body);

    if (!lat || !lng) {
      console.log("❌ Missing latitude or longitude");
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      console.log(`❌ Bus not found for ID: ${busId}`);
      return res.status(404).json({ error: "Bus not found" });
    }

    console.log(`✅ Found bus: ${busId}, updating location...`);

    bus.location = {
      type: "Point",
      coordinates: [lng, lat] // GeoJSON order
    };
    bus.speed = speed || null;
    bus.lastUpdated = timestamp || new Date();

    await bus.save();

    console.log(`✅ Bus ${busId} location updated successfully`);
    res.json({ message: "Bus location updated", bus });
  } catch (error) {
    console.error("🔥 Error in updateBusLocation:", error.message);
    res.status(500).json({ error: error.message });
  }
};



function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

exports.subscribeBus = async (req, res) => {
  try {
    const { busId, userId } = req.body;

    const bus = await Bus.findById(busId);
    const user = await User.findById(userId);

    if (!bus || !user) {
      return res.status(404).json({ error: "Bus or User not found" });
    }

    // Start polling for demo (every 5s = ~1min real-time)
    let interval = setInterval(async () => {
      const freshBus = await Bus.findById(busId);
      const freshUser = await User.findById(userId);

      if (!freshBus || !freshUser) {
        clearInterval(interval);
        return;
      }

      const [busLng, busLat] = freshBus.location.coordinates;
      const [userLng, userLat] = freshUser.location.coordinates;

      const distance = getDistance(userLat, userLng, busLat, busLng);

      if (distance > 0.1) {
        // Assume average bus speed = 30 km/h → 0.5 km/min
        const etaMinutes = Math.round((distance / 30) * 60);
        console.log(
          `🔔 Bus ${freshBus.busNumber} is ${etaMinutes} min away (${distance.toFixed(
            2
          )} km)`
        );
      } else {
        console.log(`✅ Bus ${freshBus.busNumber} has ARRIVED at user`);
        clearInterval(interval);
      }
    }, 5000);

    res.json({
      message: `Subscribed to bus ${bus.busNumber} for notifications`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

