const mongoose = require("mongoose");
const config = require(".");
const logger = require("../utils/logger");

const connectDB = async () => {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  logger.info("database.connected");
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

module.exports = { connectDB, isDatabaseReady };
