const mongoose = require("mongoose");
const User = require("../models/User");
const { getPanchang } = require("./prokeralaService");
const panchangCacheService = require("./panchangCacheService");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const inFlightRequests = new Map();

// Helper to get today's date in YYYY-MM-DD and full ISO at 00:00:00 IST
const getIndiaTodayDetails = () => {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);

  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istDate.getUTCDate()).padStart(2, "0");

  const dateStr = `${year}-${month}-${day}`;
  const datetime = `${dateStr}T00:30:00Z`;

  const expiresAt = new Date(Date.UTC(year, Number(month) - 1, Number(day) + 1, 18, 30));

  return { date: dateStr, datetime, expiresAt };
};

const getPanchangForUser = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user identity.", 401);
  }

  const user = await User.findById(userId).select("birthLatitude birthLongitude").lean();
  if (!user) throw new AppError("User not found.", 404);

  // Fallback to Delhi coordinates if null or undefined
  const lat = (user.birthLatitude !== null && user.birthLatitude !== undefined && !isNaN(user.birthLatitude)) ? user.birthLatitude : 28.6139;
  const lon = (user.birthLongitude !== null && user.birthLongitude !== undefined && !isNaN(user.birthLongitude)) ? user.birthLongitude : 77.2090;

  const { date, datetime, expiresAt } = getIndiaTodayDetails();
  const latitudeRounded = Math.round(lat * 100) / 100;
  const longitudeRounded = Math.round(lon * 100) / 100;
  const ayanamsa = 1;

  // Check Cache
  const cached = await panchangCacheService.getPanchang({
    date,
    latitudeRounded,
    longitudeRounded,
    ayanamsa,
  });

  if (cached) {
    logger.info("panchang.cache_hit", { userId });
    return { ...cached.data, cache: { status: "cached" } };
  }

  const coordinates = `${lat},${lon}`;
  const requestKey = `${date}:${latitudeRounded}:${longitudeRounded}`;

  if (!inFlightRequests.has(requestKey)) {
    logger.info("panchang.provider_request", { userId, requestKey });
    const request = (async () => {
      const response = await getPanchang({ datetime, coordinates, ayanamsa });
      if (!response || response.status !== "ok") {
        throw new AppError("Failed to fetch daily Panchang from the provider.", 502);
      }

      await panchangCacheService.savePanchang({
        date,
        latitudeRounded,
        longitudeRounded,
        ayanamsa,
        data: response.data,
        expiresAt,
      });

      logger.info("panchang.cache_write", { userId });
      return { ...response.data, cache: { status: "fresh" } };
    })().finally(() => {
      inFlightRequests.delete(requestKey);
    });

    inFlightRequests.set(requestKey, request);
  }

  return inFlightRequests.get(requestKey);
};

module.exports = {
  getPanchangForUser,
  getIndiaTodayDetails,
};
