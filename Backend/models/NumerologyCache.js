const mongoose = require("mongoose");

const numerologyCacheSchema = new mongoose.Schema(
  {
    dateOfBirth: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Unique per birth date YYYY-MM-DD
    },// pehle se cache 
    // user 1 ek hi dob ke liye sirf ek cache document generate hona chahiye humare mongodb mei
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("NumerologyCache", numerologyCacheSchema);
