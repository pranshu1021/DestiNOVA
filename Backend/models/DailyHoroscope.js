const mongoose = require("mongoose");

const dailyHoroscopeSchema = new mongoose.Schema(
  {
    zodiac: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum: [
        "aries",
        "taurus",
        "gemini",
        "cancer",
        "leo",
        "virgo",
        "libra",
        "scorpio",
        "sagittarius",
        "capricorn",
        "aquarius",
        "pisces",
      ],
    },
    period: {
      type: String,
      required: true,
      enum: ["today", "weekly", "monthly", "yearly"],
    },
    periodKey: {
      type: String,
      required: true,
      trim: true,
    },
    prediction: {
      type: String,
      required: true,
      trim: true,
    },
    luckyNumber: {
      type: String,
      default: "",
    },
    luckyColor: {
      type: String,
      default: "",
    },
    luckyLetter: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      required: true,
      default: "prokerala",
    },
    fetchedAt: {
      type: Date,
      required: true,
      default: Date.now,
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

dailyHoroscopeSchema.index(
  { zodiac: 1, period: 1, periodKey: 1 },
  { unique: true, name: "zodiac_period_periodKey_unique" }
);
dailyHoroscopeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "expiresAt_ttl" }
);

module.exports = mongoose.model("DailyHoroscope", dailyHoroscopeSchema);
