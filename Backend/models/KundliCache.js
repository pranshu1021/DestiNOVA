const mongoose = require("mongoose");

const kundliCacheSchema = new mongoose.Schema(
  {
    datetime: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    ayanamsa: {
      type: Number,
      required: true,
      default: 1,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick unique query lookups
kundliCacheSchema.index(
  { datetime: 1, latitude: 1, longitude: 1, ayanamsa: 1 },
  { unique: true, name: "kundli_unique_params" }
);

module.exports = mongoose.model("KundliCache", kundliCacheSchema);
