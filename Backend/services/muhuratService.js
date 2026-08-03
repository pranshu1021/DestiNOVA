const mongoose = require("mongoose");
const User = require("../models/User");
const { getAdvancedPanchang } = require("./prokeralaService");
const { getMuhurat, saveMuhurat } = require("./muhuratCacheService");
const { getIndiaTodayDetails } = require("./panchangService");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const inFlightRequests = new Map();

const getMuhuratForUser = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user identity.", 401);
  }

  const user = await User.findById(userId).select("birthLatitude birthLongitude").lean();
  if (!user) throw new AppError("User not found.", 404);

  const lat = (user.birthLatitude !== null && user.birthLatitude !== undefined && !isNaN(user.birthLatitude)) ? user.birthLatitude : 28.6139;
  const lon = (user.birthLongitude !== null && user.birthLongitude !== undefined && !isNaN(user.birthLongitude)) ? user.birthLongitude : 77.2090;

  const { date, datetime, expiresAt } = getIndiaTodayDetails();
  const latitudeRounded = Math.round(lat * 100) / 100;
  const longitudeRounded = Math.round(lon * 100) / 100;
  const ayanamsa = 1;

  // Check Cache
  const cached = await getMuhurat({ date, latitudeRounded, longitudeRounded, ayanamsa });
  if (cached) {
    logger.info("muhurat.cache_hit", { userId });
    return { ...cached.data, cache: { status: "cached" } };
  }

  const coordinates = `${lat},${lon}`;
  const requestKey = `${date}:${latitudeRounded}:${longitudeRounded}`;

  if (!inFlightRequests.has(requestKey)) {
    logger.info("muhurat.provider_request", { userId, requestKey });
    const request = (async () => {
      const response = await getAdvancedPanchang({ datetime, coordinates, ayanamsa });
      if (!response || response.status !== "ok") {
        throw new AppError("Failed to fetch daily Muhurat timings from the provider.", 502);
      }

      // We only cache the auspicious_period and inauspicious_period to save DB space
      const resultData = {
        auspicious_period: response.data.auspicious_period || [],
        inauspicious_period: response.data.inauspicious_period || [],
      };

      await saveMuhurat({
        date,
        latitudeRounded,
        longitudeRounded,
        ayanamsa,
        data: resultData,
        expiresAt,
      });

      logger.info("muhurat.cache_write", { userId });
      return { ...resultData, cache: { status: "fresh" } };
    })().finally(() => {
      inFlightRequests.delete(requestKey);
    });

    inFlightRequests.set(requestKey, request);
  }

  return inFlightRequests.get(requestKey);
};

module.exports = {
  getMuhuratForUser,
};
