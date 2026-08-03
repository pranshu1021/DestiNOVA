const { getKundliMatching } = require("./prokeralaService");
const { getMatching, saveMatching } = require("./matchingCacheService");
const { formatDatetimeForAstro } = require("./kundliService");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const inFlightRequests = new Map();

const getMatchingResult = async ({ boy, girl }) => {
  if (!boy || !girl) {
    throw new AppError("Both partner details (boy and girl) are required for matching.", 400);
  }

  const { dob: boyDob, time: boyTime, lat: boyLat, lon: boyLon } = boy;
  const { dob: girlDob, time: girlTime, lat: girlLat, lon: girlLon } = girl;

  if (!boyDob || !boyTime || boyLat === undefined || boyLon === undefined ||
      !girlDob || !girlTime || girlLat === undefined || girlLon === undefined) {
    throw new AppError("Missing required birth details (date, time, or location coordinates) for one or both partners.", 400);
  }

  const boy_dob = formatDatetimeForAstro(boyDob, boyTime);
  const boy_coordinates = `${boyLat},${boyLon}`;

  const girl_dob = formatDatetimeForAstro(girlDob, girlTime);
  const girl_coordinates = `${girlLat},${girlLon}`;

  const ayanamsa = 1;

  // Check cache
  const cached = await getMatching({ boy_dob, boy_coordinates, girl_dob, girl_coordinates, ayanamsa });
  if (cached) {
    logger.info("matching.cache_hit");
    return { ...cached.data, cache: { status: "cached" } };
  }

  const requestKey = `${boy_dob}:${boy_coordinates}:${girl_dob}:${girl_coordinates}`;
  if (!inFlightRequests.has(requestKey)) {
    logger.info("matching.provider_request", { requestKey });
    const request = (async () => {
      const response = await getKundliMatching({
        boy_dob,
        boy_coordinates,
        girl_dob,
        girl_coordinates,
        ayanamsa,
      });

      if (!response || response.status !== "ok") {
        throw new AppError("Failed to get compatibility details from the provider.", 502);
      }

      await saveMatching({
        boy_dob,
        boy_coordinates,
        girl_dob,
        girl_coordinates,
        ayanamsa,
        data: response.data,
      });

      logger.info("matching.cache_write");
      return { ...response.data, cache: { status: "fresh" } };
    })().finally(() => {
      inFlightRequests.delete(requestKey);
    });

    inFlightRequests.set(requestKey, request);
  }

  return inFlightRequests.get(requestKey);
};

module.exports = {
  getMatchingResult,
};
