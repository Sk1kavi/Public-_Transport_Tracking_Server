const Driver = require("../models/Driver");

// Register new driver
exports.registerDriver = async (req, res) => {
  try {
    const { name, mobile, routeAllocated } = req.body;

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ mobile });
    if (existingDriver) {
      return res.status(400).json({ message: "Driver already exists" });
    }

    const driver = new Driver({ name, mobile, routeAllocated });
    await driver.save();

    res.status(201).json({ message: "Driver registered successfully", driver });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login driver using only mobile number
exports.loginDriver = async (req, res) => {
  try {
    const { mobile } = req.body;

    const driver = await Driver.findOne({ mobile });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({ message: "Login successful", driver });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch drivers by route (query param version)
exports.getDriversByRoute = async (req, res) => {
  try {
    const { route } = req.query;
    if (!route) {
      return res.status(400).json({ error: "Route query parameter is required" });
    }

    const drivers = await Driver.find({
      routeAllocated: { $regex: `^${route}$`, $options: "i" }
    });

    // Always return 200 with array, even if empty
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Update driver route allocation
exports.updateDriverRoute = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { routeAllocated } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { routeAllocated },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({ message: "Driver route updated successfully", driver });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 inside your notification controller

exports.sendIntimation = async (req, res) => {
  try {
    const { busId, type } = req.body; // type = "breakdown" or "accident"

    if (!busId || !type) {
      return res.status(400).json({ error: "busId and type are required" });
    }

    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ error: "Bus not found" });

    // Save intimation
    bus.intimations.push({ type, timestamp: new Date() });
    await bus.save();

    // Find all users who have subscribed to this bus
    const users = await User.find({
      "notifications.busId": busId,
      pushSubscription: { $ne: null },
    });

    const payload = {
      title: `🚨 ${type.toUpperCase()} reported`,
      body: `Bus ${bus.busNumber} (${bus.routeName}) has reported a ${type}.`,
    };

    // Notify users
    for (let user of users) {
      if (user.pushSubscription) {
        await sendPushNotification(user.pushSubscription, payload);
      }
    }

    // Notify admin (you can store admin subscription separately in DB or ENV)
    if (process.env.ADMIN_SUBSCRIPTION) {
      await sendPushNotification(JSON.parse(process.env.ADMIN_SUBSCRIPTION), payload);
    }

    res.json({ message: "Intimation sent successfully ✅" });
  } catch (err) {
    console.error("❌ Intimation error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
