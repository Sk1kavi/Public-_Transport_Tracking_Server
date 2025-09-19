const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Save user subscription
router.post("/subscribe", notificationController.saveSubscription);

// Add notification preference
router.post("/add", notificationController.addNotification);

// Optionally, manually start polling for a bus (if needed)
router.post("/poll/:busId", (req, res) => {
  notificationController.pollBusProximity(req.params.busId);
  res.json({ message: "Polling started for bus" });
});

module.exports = router;
