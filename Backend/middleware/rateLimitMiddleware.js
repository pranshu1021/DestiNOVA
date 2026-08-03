const createRateLimiter = ({ windowMs, maxRequests, keyGenerator }) => {
  const requests = new Map();

  const pruneExpiredEntries = (now) => {
    if (requests.size < 1000) return;
    for (const [key, entry] of requests) {
      if (entry.resetAt <= now) requests.delete(key);
    }
  };

  return (req, res, next) => {
    const now = Date.now();
    pruneExpiredEntries(now);
    const key = keyGenerator(req);
    const entry = requests.get(key);

    if (!entry || entry.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count <= maxRequests) return next();

    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again shortly.",
    });
  };
};

const getIpKey = (req) => req.ip || req.socket.remoteAddress || "unknown";
const getUserKey = (req) => req.user?.id || getIpKey(req);

const authSignupRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  keyGenerator: getIpKey,
});

const authLoginRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyGenerator: getIpKey,
});

const horoscopeRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  keyGenerator: getUserKey,
});

module.exports = {
  authSignupRateLimit,
  authLoginRateLimit,
  horoscopeRateLimit,
};
