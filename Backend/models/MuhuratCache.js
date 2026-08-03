const mongoose = require("mongoose");

const muhuratCacheSchema = new mongoose.Schema(
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

// Compound index for daily coordinates-based Muhurat cache
muhuratCacheSchema.index(
  { date: 1, latitudeRounded: 1, longitudeRounded: 1, ayanamsa: 1 },
  { unique: true, name: "muhurat_unique_params" }
);

// TTL index to automatically purge old records
muhuratCacheSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "muhurat_ttl" }
);

module.exports = mongoose.model("MuhuratCache", muhuratCacheSchema);
