const mongoose = require("mongoose");
const User = require("../models/User");
const { getDailyPrediction } = require("./prokeralaService");
const { getHoroscope, saveHoroscope } = require("./horoscopeCacheService");
const { getZodiacFromDateOfBirth, getZodiacDateRange } = require("./zodiacService");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const INDIA_TIME_ZONE = "Asia/Kolkata";
const SUPPORTED_PERIOD = "today";
const inFlightRequests = new Map();

const logHoroscopeEvent = (event, details) => {
  logger.info(`horoscope.${event}`, details);
};

const getIndiaDateParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value])
  );
};

const getPeriodMetadata = (period) => {
  const { year, month, day } = getIndiaDateParts();
  const currentDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (period === "today") {
    return {
      periodKey: `${year}-${month}-${day}`,
      providerDatetime: `${year}-${month}-${day}T00:00:00+05:30`,
      expiresAt: new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 18, 30)),
    };
  }

  if (period === "weekly") {
    const weekday = currentDate.getUTCDay() || 7;
    currentDate.setUTCDate(currentDate.getUTCDate() - weekday + 1);
    const nextWeek = new Date(currentDate);
    nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
    return {
      periodKey: currentDate.toISOString().slice(0, 10),
      expiresAt: new Date(Date.UTC(nextWeek.getUTCFullYear(), nextWeek.getUTCMonth(), nextWeek.getUTCDate(), 18, 30)),
    };
  }

  if (period === "monthly") {
    return {
      periodKey: `${year}-${month}`,
      expiresAt: new Date(Date.UTC(Number(year), Number(month), 1, 18, 30)),
    };
  }

  if (period === "yearly") {
    return {
      periodKey: year,
      expiresAt: new Date(Date.UTC(Number(year) + 1, 0, 1, 18, 30)),
    };
  }

  throw new AppError("Unsupported horoscope period.", 400);
};

const formatHoroscope = (horoscope, cacheStatus) => ({
  period: horoscope.period,
  periodKey: horoscope.periodKey,
  zodiac: horoscope.zodiac,
  signName: `${horoscope.zodiac.charAt(0).toUpperCase()}${horoscope.zodiac.slice(1)}`,
  dateRange: getZodiacDateRange(horoscope.zodiac),
  prediction: horoscope.prediction,
  luckyNumber: horoscope.luckyNumber || null,
  luckyColor: horoscope.luckyColor || null,
  luckyLetter: horoscope.luckyLetter || null,
  source: horoscope.source,
  fetchedAt: horoscope.fetchedAt,
  expiresAt: horoscope.expiresAt,
  cache: { status: cacheStatus },
});

const fetchAndCacheToday = async ({ zodiac, periodKey, providerDatetime, expiresAt }) => {
  const response = await getDailyPrediction(zodiac, providerDatetime);
  const dailyPrediction = response?.data?.daily_prediction;

  if (!dailyPrediction?.prediction) {
    throw new AppError("The horoscope provider returned an invalid response.", 502);
  }

  const horoscope = await saveHoroscope({
    zodiac,
    period: SUPPORTED_PERIOD,
    periodKey,
    prediction: dailyPrediction.prediction,
    luckyNumber: "",
    luckyColor: "",
    luckyLetter: "",
    source: "prokerala",
    fetchedAt: new Date(),
    expiresAt,
  });

  logHoroscopeEvent("cache_write", { zodiac, period: SUPPORTED_PERIOD, periodKey });
  return formatHoroscope(horoscope, "fresh");
};

const getUserZodiac = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user identity.", 401);
  }

  const user = await User.findById(userId).select("dateOfBirth").lean();
  if (!user) throw new AppError("User not found.", 404);
  if (!user.dateOfBirth) {
    throw new AppError("Please add your date of birth to view your horoscope.", 400);
  }

  return getZodiacFromDateOfBirth(user.dateOfBirth);
};

const getHoroscopeForPeriod = async (userId, period) => {
  const zodiac = await getUserZodiac(userId);
  const metadata = getPeriodMetadata(period);
  const cachedHoroscope = await getHoroscope({ zodiac, period, periodKey: metadata.periodKey });

  if (cachedHoroscope) {
    logHoroscopeEvent("cache_hit", { zodiac, period, periodKey: metadata.periodKey });
    return formatHoroscope(cachedHoroscope, "cached");
  }

  if (period !== SUPPORTED_PERIOD) {
    throw new AppError(
      `The configured horoscope provider does not offer ${period} predictions.`,
      501
    );
  }

  const requestKey = `${zodiac}:${period}:${metadata.periodKey}`;
  if (!inFlightRequests.has(requestKey)) {
    logHoroscopeEvent("provider_request", { zodiac, period, periodKey: metadata.periodKey });
    const request = fetchAndCacheToday({ zodiac, ...metadata }).finally(() => {
      inFlightRequests.delete(requestKey);
    });
    inFlightRequests.set(requestKey, request);
  }

  return inFlightRequests.get(requestKey);
};

module.exports = { getHoroscopeForPeriod };
