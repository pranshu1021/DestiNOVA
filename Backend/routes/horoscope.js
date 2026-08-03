const express = require("express");
const protect = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { horoscopeRateLimit } = require("../middleware/rateLimitMiddleware");
const { validateHoroscopeRequest } = require("../validators");
const {
  getTodayHoroscope,
  getWeeklyHoroscope,
  getMonthlyHoroscope,
  getYearlyHoroscope,
} = require("../controllers/horoscopeController");

const router = express.Router();

router.get("/today", protect, horoscopeRateLimit, validateRequest(validateHoroscopeRequest), getTodayHoroscope);
router.get("/weekly", protect, horoscopeRateLimit, validateRequest(validateHoroscopeRequest), getWeeklyHoroscope);
router.get("/monthly", protect, horoscopeRateLimit, validateRequest(validateHoroscopeRequest), getMonthlyHoroscope);
router.get("/yearly", protect, horoscopeRateLimit, validateRequest(validateHoroscopeRequest), getYearlyHoroscope);

module.exports = router;
