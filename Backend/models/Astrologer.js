const mongoose = require("mongoose");

const astrologerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    experienceYears: { type: Number, default: 1 },
    languages: [{ type: String }],
    skills: [{ type: String }],
    expertise: [{ type: String }],
    about: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    certificates: [{ type: String }],
    chatPricePerMinute: { type: Number, default: 15 },
    callPricePerMinute: { type: Number, default: 20 },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: true },
    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Astrologer", astrologerSchema);
