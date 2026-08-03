const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const config = require("../config");
const AppError = require("../utils/AppError");

const PASSWORD_SALT_ROUNDS = 12;
const googleClient = new OAuth2Client(config.googleWebClientId);

const toPublicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  photo: user.photo,
  gender: user.gender,
  dateOfBirth: user.dateOfBirth,
  birthTime: user.birthTime,
  birthPlace: user.birthPlace,
  birthLatitude: user.birthLatitude,
  birthLongitude: user.birthLongitude,
  profileCompleted: user.profileCompleted,
  notificationSettings: user.notificationSettings,
  isPremium: user.isPremium,
  premiumExpiresAt: user.premiumExpiresAt,
});

const createAccessToken = (userId) => jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: "7d", algorithm: "HS256" });

const signup = async ({ fullName, email, phone, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail }).lean();
  if (existingUser) throw new AppError("Email already registered.", 409);

  try {
    await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: await bcrypt.hash(password, PASSWORD_SALT_ROUNDS),
    });
  } catch (error) {
    if (error?.code === 11000) throw new AppError("Email already registered.", 409);
    throw error;
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  const passwordMatches = user?.password ? await bcrypt.compare(password, user.password) : false;
  if (!user || !passwordMatches) throw new AppError("Invalid email or password.", 401);

  return { token: createAccessToken(user._id), user: toPublicUser(user) };
};

const googleLogin = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.googleWebClientId,
  });
  const { sub: googleId, name, email, picture } = ticket.getPayload();
  if (!googleId || !email) throw new AppError("Unable to verify Google account.", 401);

  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await User.create({
      fullName: name || "DestiNOVA User",
      email: email.toLowerCase(),
      provider: "google",
      googleId,
      photo: picture || "",
    });
  }

  return { token: createAccessToken(user._id), user: toPublicUser(user) };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password").lean();
  if (!user) throw new AppError("User not found.", 404);
  return user;
};

const updateProfile = async (userId, payload) => {
  const updateFields = {};
  const allowedFields = ["fullName", "gender", "dateOfBirth", "birthTime", "phone", "birthPlace", "birthLatitude", "birthLongitude", "notificationSettings", "isPremium", "premiumExpiresAt"];
  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) updateFields[field] = typeof payload[field] === "string" ? payload[field].trim() : payload[field];
  });

  const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true, runValidators: true }).select("-password");
  if (!updatedUser) throw new AppError("User not found.", 404);

  const profileCompleted = Boolean(
    updatedUser.fullName && updatedUser.gender && updatedUser.dateOfBirth && updatedUser.birthTime && updatedUser.birthPlace
  );
  if (updatedUser.profileCompleted !== profileCompleted) {
    updatedUser.profileCompleted = profileCompleted;
    await updatedUser.save();
  }

  return updatedUser;
};

module.exports = { signup, login, googleLogin, getProfile, updateProfile };
