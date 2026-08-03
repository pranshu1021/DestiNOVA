const axios = require("axios");
const config = require("../config");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const PROKERALA_BASE_URL = "https://api.prokerala.com";
const DAILY_HOROSCOPE_PATH = "/v2/horoscope/daily";
const KUNDLI_PATH = "/v2/astrology/kundli";
const MATCHING_PATH = "/v2/astrology/kundli-matching/advanced";
const PANCHANG_PATH = "/v2/astrology/panchang";
const ADVANCED_PANCHANG_PATH = "/v2/astrology/panchang/advanced";
const LIFE_PATH_NUMBER_PATH = "/v2/numerology/life-path-number";

const REQUEST_TIMEOUT_MS = 10000;
let accessToken = null;
let tokenExpiry = 0;

const getAccessToken = async () => {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  try {
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.prokeralaClientId,
      client_secret: config.prokeralaClientSecret,
    });
    const response = await axios.post(`${PROKERALA_BASE_URL}/token`, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: REQUEST_TIMEOUT_MS,
    });

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + Math.max(response.data.expires_in - 60, 0) * 1000;
    return accessToken;
  } catch (error) {
    logger.error("prokerala.oauth.failed", { statusCode: error.response?.status, message: error.message });
    throw new AppError("Unable to authenticate with the horoscope provider.", 502);
  }
};

const getDailyPrediction = async (zodiac, datetime) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`${PROKERALA_BASE_URL}${DAILY_HOROSCOPE_PATH}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { datetime, sign: zodiac },
      timeout: REQUEST_TIMEOUT_MS,
    });
    return response.data;
  } catch (error) {
    logger.error("prokerala.daily.failed", { statusCode: error.response?.status, message: error.message });
    throw new AppError("Unable to fetch today's horoscope from the provider.", error.response?.status === 429 ? 429 : 502);
  }
};

const getKundliDetails = async ({ datetime, coordinates, ayanamsa = 1, la = "en" }) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`${PROKERALA_BASE_URL}${KUNDLI_PATH}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { datetime, coordinates, ayanamsa, la },
      timeout: REQUEST_TIMEOUT_MS,
    });
    return response.data;
  } catch (error) {
    // logger.error("prokerala.kundli.failed", { statusCode: error.response?.status, message: error.message });
console.log("========== KUNDLI ERROR ==========");
console.log("STATUS:", error.response?.status);
console.log("DATA:", error.response?.data);
console.log("REQUEST PARAMS:", {
  datetime,
  coordinates,
  ayanamsa,
  la,
});
console.log("==================================");    
    
    throw new AppError("Unable to generate Kundli from the provider.", error.response?.status === 429 ? 429 : 502);
  }
};

const getKundliMatching = async ({
  boy_dob,
  boy_coordinates,
  girl_dob,
  girl_coordinates,
  ayanamsa = 1,
  la = "en",
}) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`${PROKERALA_BASE_URL}${MATCHING_PATH}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        girl_dob,
        girl_coordinates,
        boy_dob,
        boy_coordinates,
        ayanamsa,
        la,
      },
      timeout: REQUEST_TIMEOUT_MS,
    });
    return response.data;
  } catch (error) {
    logger.error("prokerala.matching.failed", { statusCode: error.response?.status, message: error.message });
    throw new AppError("Unable to match Kundlis from the provider.", error.response?.status === 429 ? 429 : 502);
  }
};

const formatSandboxDatetime = (dt) => {
  if (!dt || typeof dt !== "string") return dt;
  return dt.replace(/^(\d{4})-\d{2}-\d{2}/, "$1-01-01");
};

const getPanchang = async ({ datetime, coordinates, ayanamsa = 1, la = "en" }) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`${PROKERALA_BASE_URL}${PANCHANG_PATH}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { datetime, coordinates, ayanamsa, la },
      timeout: REQUEST_TIMEOUT_MS,
    });
    return response.data;
  } catch (error) {
    const isSandboxError = JSON.stringify(error.response?.data || "").toLowerCase().includes("sandbox");
    if (isSandboxError && datetime) {
      try {
        const token = await getAccessToken();
        const response = await axios.get(`${PROKERALA_BASE_URL}${PANCHANG_PATH}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { datetime: formatSandboxDatetime(datetime), coordinates, ayanamsa, la },
          timeout: REQUEST_TIMEOUT_MS,
        });
        return response.data;
      } catch (retryError) {
        logger.error("prokerala.panchang.sandbox_retry_failed", { message: retryError.message });
      }
    }
    logger.error("prokerala.panchang.failed", { statusCode: error.response?.status, message: error.message, details: error.response?.data });
    throw new AppError("Unable to fetch Panchang from the provider.", error.response?.status === 429 ? 429 : 502);
  }
};

const getAdvancedPanchang = async ({ datetime, coordinates, ayanamsa = 1, la = "en" }) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`${PROKERALA_BASE_URL}${ADVANCED_PANCHANG_PATH}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { datetime, coordinates, ayanamsa, la },
      timeout: REQUEST_TIMEOUT_MS,
    });
    return response.data;
  } catch (error) {
    const isSandboxError = JSON.stringify(error.response?.data || "").toLowerCase().includes("sandbox");
    if (isSandboxError && datetime) {
      try {
        const token = await getAccessToken();
        const response = await axios.get(`${PROKERALA_BASE_URL}${ADVANCED_PANCHANG_PATH}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { datetime: formatSandboxDatetime(datetime), coordinates, ayanamsa, la },
          timeout: REQUEST_TIMEOUT_MS,
        });
        return response.data;
      } catch (retryError) {
        logger.error("prokerala.advancedPanchang.sandbox_retry_failed", { message: retryError.message });
      }
    }
    logger.error("prokerala.advancedPanchang.failed", { statusCode: error.response?.status, message: error.message });
    throw new AppError("Unable to fetch advanced Panchang from the provider.", error.response?.status === 429 ? 429 : 502);
  }
};

const getLifePathNumber = async ({ datetime }) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`${PROKERALA_BASE_URL}${LIFE_PATH_NUMBER_PATH}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { datetime },
      timeout: REQUEST_TIMEOUT_MS,
    });
    return response.data;
  } catch (error) {
    logger.error("prokerala.lifepath.failed", { statusCode: error.response?.status, message: error.message });
    throw new AppError("Unable to calculate Life Path number from the provider.", error.response?.status === 429 ? 429 : 502);
  }
};

module.exports = {
  getAccessToken,
  getDailyPrediction,
  getKundliDetails,
  getKundliMatching,
  getPanchang,
  getAdvancedPanchang,
  getLifePathNumber,
};
