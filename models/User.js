const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  mailId: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Device GPS location (updated when subscribing to a bus)
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
  }
});

// Index for location queries
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
