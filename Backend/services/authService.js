const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const Astrologer = require("../models/Astrologer");

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

  isAdmin: user.isAdmin,
  isSuspended: user.isSuspended,
});

const createAccessToken = (userId) =>
  jwt.sign(
    { id: userId },
    config.jwtSecret,
    {
      expiresIn: "7d",
      algorithm: "HS256",
    }
  );

const signup = async ({ fullName, email, phone, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  }).lean();

  if (existingUser) {
    throw new AppError("Email already registered.", 409);
  }

  try {
    await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: await bcrypt.hash(
        password,
        PASSWORD_SALT_ROUNDS
      ),
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(
        "Email already registered.",
        409
      );
    }

    throw error;
  }
};
const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Find astrologer profile (if user has applied)
  const astrologer = await Astrologer.findOne({
    userId: user._id,
  }).lean();

  return {
    token: createAccessToken(user._id),

    user: {
      ...toPublicUser(user),

      astrologer: astrologer
        ? {
            id: astrologer._id,
            isApproved: astrologer.isApproved,
            isOnline: astrologer.isOnline,
            experienceYears: astrologer.experienceYears,
            chatPricePerMinute: astrologer.chatPricePerMinute,
            callPricePerMinute: astrologer.callPricePerMinute,
            rating: astrologer.rating,
            reviewsCount: astrologer.reviewsCount,
            walletBalance: astrologer.walletBalance,
            totalEarnings: astrologer.totalEarnings,
          }
        : null,
    },
  };
};
const googleLogin = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.googleWebClientId,
  });

  const {
    sub: googleId,
    name,
    email,
    picture,
  } = ticket.getPayload();

  if (!googleId || !email) {
    throw new AppError(
      "Unable to verify Google account.",
      401
    );
  }

  let user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    user = await User.create({
      fullName: name || "DestiNOVA User",
      email: email.toLowerCase(),
      provider: "google",
      googleId,
      photo: picture || "",
    });
  }

  // Check astrologer profile
  const astrologer = await Astrologer.findOne({
    userId: user._id,
  }).lean();

  return {
    token: createAccessToken(user._id),

    user: {
      ...toPublicUser(user),

      astrologer: astrologer
        ? {
            id: astrologer._id,
            isApproved: astrologer.isApproved,
            isOnline: astrologer.isOnline,
            experienceYears: astrologer.experienceYears,
            chatPricePerMinute: astrologer.chatPricePerMinute,
            callPricePerMinute: astrologer.callPricePerMinute,
            rating: astrologer.rating,
            reviewsCount: astrologer.reviewsCount,
            walletBalance: astrologer.walletBalance,
            totalEarnings: astrologer.totalEarnings,
          }
        : null,
    },
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .select("-password")
    .lean();

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const astrologer = await Astrologer.findOne({
    userId,
  }).lean();

  return {
    ...user,

    astrologer: astrologer
      ? {
          id: astrologer._id,
          isApproved: astrologer.isApproved,
          isOnline: astrologer.isOnline,
          experienceYears: astrologer.experienceYears,
          chatPricePerMinute: astrologer.chatPricePerMinute,
          callPricePerMinute: astrologer.callPricePerMinute,
          rating: astrologer.rating,
          reviewsCount: astrologer.reviewsCount,
          walletBalance: astrologer.walletBalance,
          totalEarnings: astrologer.totalEarnings,
        }
      : null,
  };
};
const updateProfile = async (userId, payload) => {
  const updateFields = {};

  const allowedFields = [
    "fullName",
    "gender",
    "dateOfBirth",
    "birthTime",
    "phone",
    "birthPlace",
    "birthLatitude",
    "birthLongitude",
    "notificationSettings",
    "isPremium",
    "premiumExpiresAt",
  ];

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      updateFields[field] =
        typeof payload[field] === "string"
          ? payload[field].trim()
          : payload[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: updateFields,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (!updatedUser) {
    throw new AppError("User not found.", 404);
  }

  // Check if onboarding is complete
  const profileCompleted = Boolean(
    updatedUser.fullName &&
      updatedUser.gender &&
      updatedUser.dateOfBirth &&
      updatedUser.birthTime &&
      updatedUser.birthPlace
  );

  if (updatedUser.profileCompleted !== profileCompleted) {
    updatedUser.profileCompleted = profileCompleted;
    await updatedUser.save();
  }

  // Fetch astrologer profile (if exists)
  const astrologer = await Astrologer.findOne({
    userId,
  }).lean();

  return {
    ...updatedUser.toObject(),

    astrologer: astrologer
      ? {
          id: astrologer._id,
          isApproved: astrologer.isApproved,
          isOnline: astrologer.isOnline,
          experienceYears: astrologer.experienceYears,
          chatPricePerMinute: astrologer.chatPricePerMinute,
          callPricePerMinute: astrologer.callPricePerMinute,
          rating: astrologer.rating,
          reviewsCount: astrologer.reviewsCount,
          walletBalance: astrologer.walletBalance,
          totalEarnings: astrologer.totalEarnings,
        }
      : null,
  };
};

module.exports = {
  signup,
  login,
  googleLogin,
  getProfile,
  updateProfile,
};