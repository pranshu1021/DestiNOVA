const SENSITIVE_KEY_PATTERN = /password|token|secret|authorization|cookie|idtoken/i;

const redact = (value, key = "") => {
  if (SENSITIVE_KEY_PATTERN.test(key)) return "[REDACTED]";
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [entryKey, redact(entryValue, entryKey)]));
  }
  return value;
};

const write = (level, event, metadata = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...redact(metadata),
  };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
};

module.exports = {
  info: (event, metadata) => write("info", event, metadata),
  warn: (event, metadata) => write("warn", event, metadata),
  error: (event, metadata) => write("error", event, metadata),
};
