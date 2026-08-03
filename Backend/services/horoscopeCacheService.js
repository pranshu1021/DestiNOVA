const DailyHoroscope = require("../models/DailyHoroscope");

const getHoroscope = async ({ zodiac, period, periodKey }) => {
  return DailyHoroscope.findOne({
    zodiac: zodiac.toLowerCase(),
    period,
    periodKey,
    expiresAt: { $gt: new Date() },
  }).lean();
};

const saveHoroscope = async (data) => {
  return DailyHoroscope.findOneAndUpdate(
    {
      zodiac: data.zodiac.toLowerCase(),
      period: data.period,
      periodKey: data.periodKey,
    },
    { $set: data },
    { new: true, upsert: true, runValidators: true, lean: true }
  ).lean();
};

module.exports = {
  getHoroscope,
  saveHoroscope,
};
