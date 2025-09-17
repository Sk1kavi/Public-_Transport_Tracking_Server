const express = require("express");
const router = express.Router();
const {
  registerDriver,
  loginDriver,
  getDriversByRoute,
  updateDriverRoute,
} = require("../controllers/driverController");

// Register driver
router.post("/register", registerDriver);

// Login driver
router.post("/login", loginDriver);

// Fetch drivers by route
router.get("/route", getDriversByRoute);

// Update driver route
router.put("/update/:driverId", updateDriverRoute);

module.exports = router;
