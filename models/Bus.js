const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  order: { type: Number, required: true },  // sequence of stop in route
  etaMinutes: { type: Number },             // ETA from source to this stop
});

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  routeName: { type: String, required: true }, // e.g., "City A - City B"
  source: { type: String, required: true },
  destination: { type: String, required: true },

  // All stops in the route
  stops: [stopSchema],

  // Dispatch timings for the day
  dispatchTimings: {
    fromSource: [{ type: String }],       // e.g., ["08:00", "12:00", "16:00"]
    fromDestination: [{ type: String }]   // e.g., ["10:00", "14:00", "18:00"]
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
