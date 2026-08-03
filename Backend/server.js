const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./config");
const { connectDB, isDatabaseReady } = require("./config/db");
const authRoutes = require("./routes/auth");
const horoscopeRoutes = require("./routes/horoscope");
const AppError = require("./utils/AppError");
const logger = require("./utils/logger");

const app = express();
let server;
let isShuttingDown = false;

const corsOptions = {
  origin(origin, callback) {
    if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new AppError("Origin is not allowed.", 403));
  },
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.disable("x-powered-by");
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    database: isDatabaseReady() ? "connected" : "disconnected",
    uptime: Math.floor(process.uptime()),
  });
});

app.get("/ready", (req, res) => {
  const database = isDatabaseReady() ? "connected" : "disconnected";
  res.status(database === "connected" ? 200 : 503).json({ status: database === "connected" ? "ready" : "not_ready", database });
});

app.use("/api/auth", authRoutes);
app.use("/api/horoscope", horoscopeRoutes);
app.use("/api/kundli", require("./routes/kundli"));
app.use("/api/matching", require("./routes/matching"));
app.use("/api/panchang", require("./routes/panchang"));
app.use("/api/muhurat", require("./routes/muhurat"));
app.use("/api/numerology", require("./routes/numerology"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/history", require("./routes/history"));

app.use((req, res, next) => next(new AppError("Route not found.", 404)));

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || (error instanceof SyntaxError ? 400 : 500);
  const message = error.isOperational || statusCode < 500 ? error.message : "Internal Server Error";
  logger.error("request.failed", { method: req.method, path: req.originalUrl, statusCode, message: error.message });
  res.status(statusCode).json({ success: false, message });
});

const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info("server.shutdown.started", { signal });
  const forceExit = setTimeout(() => process.exit(1), 10000);
  forceExit.unref();

  server.close(async (error) => {
    if (error) logger.error("server.shutdown.http_failed", { message: error.message });
    await mongoose.connection.close(false);
    logger.info("server.shutdown.completed");
    process.exit(error ? 1 : 0);
  });
};

const startServer = async () => {
  await connectDB();
  server = app.listen(config.port, () => logger.info("server.started", { port: config.port, environment: config.nodeEnv }));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
  return server;
};

if (require.main === module) {
  startServer().catch((error) => {
    logger.error("server.start_failed", { message: error.message });
    process.exit(1);
  });
}

module.exports = { app, startServer };
