const mongoose = require("mongoose");

const matchingCacheSchema = new mongoose.Schema(
  {
    boy_dob: {
      type: String,
      required: true,
      trim: true,
    },
    boy_coordinates: {
      type: String,
      required: true,
      trim: true,
    },
    girl_dob: {
      type: String,
      required: true,
      trim: true,
    },
    girl_coordinates: {
      type: String,
      required: true,
      trim: true,
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

// Compound index to quickly find matched pairs
matchingCacheSchema.index(
  { boy_dob: 1, boy_coordinates: 1, girl_dob: 1, girl_coordinates: 1, ayanamsa: 1 },
  { unique: true, name: "matching_unique_params" }
);

module.exports = mongoose.model("MatchingCache", matchingCacheSchema);
