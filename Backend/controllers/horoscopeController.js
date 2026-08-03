const horoscopeService = require("../services/horoscopeService");

const createHoroscopeHandler = (period) => async (req, res, next) => {
  try {
    const data = await horoscopeService.getHoroscopeForPeriod(req.user.id, period);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTodayHoroscope: createHoroscopeHandler("today"),
  getWeeklyHoroscope: createHoroscopeHandler("weekly"),
  getMonthlyHoroscope: createHoroscopeHandler("monthly"),
  getYearlyHoroscope: createHoroscopeHandler("yearly"),
};
