const mongoose = require("mongoose");
const User = require("../models/User");
const { getLifePathNumber } = require("./prokeralaService");
const { getNumerology, saveNumerology } = require("./numerologyCacheService");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const inFlightRequests = new Map();

const getNumerologyForUser = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user identity.", 401);
  }

  const user = await User.findById(userId).select("dateOfBirth").lean();
  if (!user) throw new AppError("User not found.", 404);

  const { dateOfBirth } = user;
  if (!dateOfBirth) {
    throw new AppError("Please complete your birth profile details before requesting Numerology.", 400);
  }

  const d = new Date(dateOfBirth);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  // Check Cache
  const cached = await getNumerology({ dateOfBirth: dateStr });
  if (cached) {
    logger.info("numerology.cache_hit", { userId });
    return { ...cached.data, cache: { status: "cached" } };
  }

  const datetime = `${dateStr}T12:00:00+05:30`; // Noon-ish DOB timestamp
  const requestKey = dateStr;

  if (!inFlightRequests.has(requestKey)) {
    logger.info("numerology.provider_request", { userId, requestKey });
    const request = (async () => {
      const response = await getLifePathNumber({ datetime });
      if (!response || response.status !== "ok") {
        throw new AppError("Failed to calculate Life Path number from the provider.", 502);
      }

      await saveNumerology({
        dateOfBirth: dateStr,
        data: response.data,
      });

      logger.info("numerology.cache_write", { userId });
      return { ...response.data, cache: { status: "fresh" } };
    })().finally(() => {
      inFlightRequests.delete(requestKey);
    });

    inFlightRequests.set(requestKey, request);
  }

  return inFlightRequests.get(requestKey);
};

module.exports = {
  getNumerologyForUser,
};
