
const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  order: { type: Number, required: true },  // sequence of stop in route
  etaMinutes: { type: Number },             // ETA from source to this stop
});

const busSchema = new mongoose.Schema({
  contractor: { type: String, required: true }, // Punjab Roadways / PRTC / Govt Contractor
  busCode: { type: String, required: true, unique: true }, // e.g., PUNBUS-101, PRTC-205
  routeName: { type: String, required: true }, // e.g., "Ludhiana - Amritsar"
  source: { type: String, required: true },
  destination: { type: String, required: true },

  // All stops in the route
  stops: [stopSchema],

  // Dispatch timings for the day
  dispatchTimings: {
    fromSource: [{ type: String }],       // e.g., ["04:30", "09:00", "15:00"]
    fromDestination: [{ type: String }]   // e.g., ["07:15", "11:45", "18:10"]
  },

  // Current GPS location of the bus
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
  },

  // Operational flags
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Create a geospatial index for location queries
busSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Bus", busSchema);