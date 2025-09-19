const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
  stopLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  type: { type: String, enum: ["one-time", "daily"], required: true },
  time: { type: String }, // "HH:mm" format for daily
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  mailId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
  },
  pushSubscription: { type: Object },
  notifications: [notificationSchema],
});

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
