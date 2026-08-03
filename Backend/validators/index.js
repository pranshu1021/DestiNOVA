const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;
const TIME_PATTERN = /^((0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)|([01]\d|2[0-3]):[0-5]\d)$/i;
const ALLOWED_PROFILE_FIELDS = new Set([
  "fullName",
  "gender",
  "dateOfBirth",
  "birthTime",
  "phone",
  "birthPlace",
  "birthLatitude",
  "birthLongitude",
  "profileCompleted",
  "notificationSettings",
  "isPremium",
  "premiumExpiresAt",
]);

const isNonEmptyString = (value, minLength = 1, maxLength = 255) =>
  typeof value === "string" && value.trim().length >= minLength && value.trim().length <= maxLength;

const validateSignup = (req) => {
  const { fullName, email, phone, password } = req.body || {};
  if (!isNonEmptyString(fullName, 2, 80)) return ["Full name must be between 2 and 80 characters."];
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) return ["A valid email is required."];
  if (typeof phone !== "string" || !PHONE_PATTERN.test(phone.trim())) return ["A valid phone number is required."];
  if (typeof password !== "string" || password.length < 8 || password.length > 72) return ["Password must be between 8 and 72 characters."];
  return [];
};

const validateLogin = (req) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) return ["A valid email is required."];
  if (!isNonEmptyString(password, 1, 72)) return ["Email or password is invalid."];
  return [];
};

const validateGoogleLogin = (req) => {
  if (!isNonEmptyString(req.body?.idToken, 20, 4096)) return ["A valid Google credential is required."];
  return [];
};

const validateProfileUpdate = (req) => {
  const body = req.body || {};
  const unknownField = Object.keys(body).find((field) => !ALLOWED_PROFILE_FIELDS.has(field));
  if (unknownField) return ["Profile contains an unsupported field."];
  if (Object.keys(body).length === 0) return ["At least one profile field is required."];
  if (body.fullName !== undefined && !isNonEmptyString(body.fullName, 2, 80)) return ["Full name must be between 2 and 80 characters."];
  if (body.phone !== undefined && (typeof body.phone !== "string" || !PHONE_PATTERN.test(body.phone.trim()))) return ["A valid phone number is required."];
  if (body.gender !== undefined && !["Male", "Female", "Other", ""].includes(body.gender)) return ["Gender is invalid."];
  if (body.dateOfBirth !== undefined && (Number.isNaN(new Date(body.dateOfBirth).getTime()) || new Date(body.dateOfBirth) > new Date())) return ["Date of birth is invalid."];
  if (body.birthTime !== undefined && body.birthTime !== "" && (typeof body.birthTime !== "string" || !TIME_PATTERN.test(body.birthTime))) return ["Birth time is invalid."];
  if (body.birthPlace !== undefined && !isNonEmptyString(body.birthPlace, 2, 160)) return ["Birth place must be between 2 and 160 characters."];
  if (body.birthLatitude !== undefined && (typeof body.birthLatitude !== "number" || body.birthLatitude < -90 || body.birthLatitude > 90)) return ["Birth latitude is invalid."];
  if (body.birthLongitude !== undefined && (typeof body.birthLongitude !== "number" || body.birthLongitude < -180 || body.birthLongitude > 180)) return ["Birth longitude is invalid."];
  if (body.profileCompleted !== undefined && typeof body.profileCompleted !== "boolean") return ["Profile completion status is invalid."];
  return [];
};

const validateHoroscopeRequest = (req) => {
  if (Object.keys(req.query || {}).length > 0) return ["Horoscope query parameters are not supported."];
  return [];
};

module.exports = {
  validateSignup,
  validateLogin,
  validateGoogleLogin,
  validateProfileUpdate,
  validateHoroscopeRequest,
};
