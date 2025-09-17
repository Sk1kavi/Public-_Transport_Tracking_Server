const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true, // mobile used for login
  },
  routeAllocated: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Driver", driverSchema);
