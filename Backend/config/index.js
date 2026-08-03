const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const REQUIRED_ENVIRONMENT_VARIABLES = [
  "MONGO_URI",
  "JWT_SECRET",
  "GOOGLE_WEB_CLIENT_ID",
  "PROKERALA_CLIENT_ID",
  "PROKERALA_CLIENT_SECRET",
];

const getAllowedOrigins = (nodeEnv, originsValue) => {
  const configuredOrigins = (originsValue || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const developmentOrigins = [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:19006",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:19006",
  ];

  if (nodeEnv === "production" && configuredOrigins.length === 0) {
    throw new Error("CORS_ORIGINS must contain at least one production origin.");
  }

  return [...new Set(nodeEnv === "production" ? configuredOrigins : [...developmentOrigins, ...configuredOrigins])];
};

const validateConfig = () => {
  const missing = REQUIRED_ENVIRONMENT_VARIABLES.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long.");
  }
};

validateConfig();

const nodeEnv = process.env.NODE_ENV || "development";

module.exports = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  prokeralaClientId: process.env.PROKERALA_CLIENT_ID,
  prokeralaClientSecret: process.env.PROKERALA_CLIENT_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  corsOrigins: getAllowedOrigins(nodeEnv, process.env.CORS_ORIGINS),
});
