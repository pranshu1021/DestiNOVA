const mongoose = require("mongoose");
const connectDB = require("../config/db");
const DailyHoroscope = require("../models/DailyHoroscope");
const logger = require("../utils/logger");

const dropIndexIfPresent = async (name) => {
  try {
    await DailyHoroscope.collection.dropIndex(name);
    logger.info("horoscope.index.dropped", { name });
  } catch (error) {
    if (error.codeName !== "IndexNotFound") throw error;
  }
};

const migrate = async () => {
  await connectDB();
  await dropIndexIfPresent("zodiac_1");
  await dropIndexIfPresent("expiresAt_1");
  await DailyHoroscope.collection.createIndex(
    { zodiac: 1, period: 1, periodKey: 1 },
    { unique: true, name: "zodiac_period_periodKey_unique" }
  );
  await DailyHoroscope.collection.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: "expiresAt_ttl" }
  );
  logger.info("horoscope.index.migrated");
};

migrate()
  .catch((error) => {
    logger.error("horoscope.index.migration_failed", { message: error.message });
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
