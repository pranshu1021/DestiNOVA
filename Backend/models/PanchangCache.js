const mongoose = require("mongoose");

const panchangCacheSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },
    latitudeRounded: {
      type: Number,
      required: true,
    },
    longitudeRounded: {
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
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for daily location-based panchang cache
panchangCacheSchema.index(
  { date: 1, latitudeRounded: 1, longitudeRounded: 1, ayanamsa: 1 },
  { unique: true, name: "panchang_unique_params" }
);

// TTL index to automatically purge old panchang data after expiry
panchangCacheSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "panchang_ttl" }
);

module.exports = mongoose.model("PanchangCache", panchangCacheSchema);
