const mongoose = require("mongoose");
const User = require("../models/User");
const { getKundliDetails } = require("./prokeralaService");
const { getKundli, saveKundli } = require("./kundliCacheService");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const inFlightRequests = new Map();

const formatDatetimeForAstro = (dateOfBirth, birthTime) => {
  let year;
  let month;
  let day;

  if (typeof dateOfBirth === "string") {
    const cleanDate = dateOfBirth.split("T")[0];
    [year, month, day] = cleanDate.split("-");
  } else {
    const d = new Date(dateOfBirth);

    year = d.getUTCFullYear().toString();
    month = String(d.getUTCMonth() + 1).padStart(2, "0");
    day = String(d.getUTCDate()).padStart(2, "0");
  }

  // Sandbox workaround
  if (process.env.PROKERALA_SANDBOX === "true") {
    month = "01";
    day = "01";
  }

  let hours = 12;
  let minutes = 0;

  const match = birthTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);

  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);

    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  } else {
    const timeParts = birthTime.split(":");

    if (timeParts.length >= 2) {
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
    }
  }

  const utcTimeMs = Date.UTC(Number(year), Number(month) - 1, Number(day), hours - 5, minutes - 30, 0);
  return new Date(utcTimeMs).toISOString();
};

const getKundliForUser = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user identity.", 401);
  }

  const user = await User.findById(userId)
    .select("dateOfBirth birthTime birthPlace birthLatitude birthLongitude")
    .lean();

  if (!user) throw new AppError("User not found.", 404);

  const { dateOfBirth, birthTime, birthPlace, birthLatitude, birthLongitude } = user;

  if (!dateOfBirth || !birthTime || !birthPlace || birthLatitude === null || birthLongitude === null) {
    throw new AppError("Please complete your birth profile details before generating your Kundli.", 400);
  }

  const datetime = formatDatetimeForAstro(dateOfBirth, birthTime);
  const coordinates = `${birthLatitude},${birthLongitude}`;
  const ayanamsa = 1;

  // Check cache
  const cached = await getKundli({ datetime, latitude: birthLatitude, longitude: birthLongitude, ayanamsa });
  if (cached) {
    logger.info("kundli.cache_hit", { userId });
    return { ...cached.data, cache: { status: "cached" } };
  }

  const requestKey = `${datetime}:${birthLatitude}:${birthLongitude}`;
  if (!inFlightRequests.has(requestKey)) {
    logger.info("kundli.provider_request", { userId, requestKey });
    const request = (async () => {
      const response = await getKundliDetails({ datetime, coordinates, ayanamsa });
     
      console.log("KUNDLI RESPONSE:");
console.log(JSON.stringify(response, null, 2));
     
      if (!response || response.status !== "ok") {
        throw new AppError("Failed to get valid horoscope chart details from the provider.", 502);
      }

      await saveKundli({
        datetime,
        latitude: birthLatitude,
        longitude: birthLongitude,
        ayanamsa,
        data: response.data,
      });

      logger.info("kundli.cache_write", { userId });
      return { ...response.data, cache: { status: "fresh" } };
    })().finally(() => {
      inFlightRequests.delete(requestKey);
    });

    inFlightRequests.set(requestKey, request);
  }

  return inFlightRequests.get(requestKey);
};

module.exports = {
  getKundliForUser,
  formatDatetimeForAstro,
};
