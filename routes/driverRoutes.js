const express = require("express");
const router = express.Router();
const {
  registerDriver,
  loginDriver,
  getDriversByRoute,
  updateDriverRoute,
  sendIntimation,
} = require("../controllers/driverController");

// Register driver
router.post("/register", registerDriver);

// Login driver
router.post("/login", loginDriver);

// Fetch drivers by route
router.get("/route", getDriversByRoute);

// Update driver route
router.put("/update/:driverId", updateDriverRoute);

// Send intimation (breakdown/accident)
router.post("/intimation", sendIntimation);

module.exports = router;
