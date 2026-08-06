const Astrologer = require("../models/Astrologer");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const registerAstrologer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const existing = await Astrologer.findOne({ userId });
    if (existing) {
      return res.json({ success: true, message: "Astrologer application already submitted.", data: existing });
    }

    const user = await User.findById(userId).lean();
    const {
      experienceYears,
      languages,
      skills,
      expertise,
      about,
      profilePhoto,
      chatPricePerMinute,
      callPricePerMinute,
    } = req.body || {};

    const astrologer = await Astrologer.create({
      userId,
      fullName: user.fullName || "Astrologer",
      email: user.email,
      phone: user.phone || "0000000000",
      experienceYears: Number(experienceYears || 2),
      languages: Array.isArray(languages) ? languages : ["Hindi", "English"],
      skills: Array.isArray(skills) ? skills : ["Vedic", "Kundli"],
      expertise: Array.isArray(expertise) ? expertise : ["Career", "Love"],
      about: about || "Experienced Vedic Astrologer providing intuitive life guidance.",
      profilePhoto: profilePhoto || user.photo || "",
      chatPricePerMinute: Number(chatPricePerMinute || 15),
      callPricePerMinute: Number(callPricePerMinute || 20),
      isApproved: false, // Requires Admin Approval
      isOnline: true,
    });

    return res.status(201).json({ success: true, message: "Application submitted for admin approval.", data: astrologer });
  } catch (error) {
    return next(error);
  }
};

const getAstrologerList = async (req, res, next) => {
  try {
    const { search, skill, language, sortBy } = req.query || {};
    const query = { isApproved: true };

    if (search) {
      query.fullName = { $regex: search, $options: "i" };
    }
    if (skill) {
      query.skills = { $in: [skill] };
    }
    if (language) {
      query.languages = { $in: [language] };
    }

    let sortOption = { rating: -1 };
    if (sortBy === "price_low") sortOption = { chatPricePerMinute: 1 };
    if (sortBy === "price_high") sortOption = { chatPricePerMinute: -1 };
    if (sortBy === "experience") sortOption = { experienceYears: -1 };

    const list = await Astrologer.find(query).sort(sortOption).lean();
    return res.json({ success: true, data: list });
  } catch (error) {
    return next(error);
  }
};

const getAstrologerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const astrologer = await Astrologer.findById(id).lean();
    if (!astrologer) throw new AppError("Astrologer not found.", 404);
    return res.json({ success: true, data: astrologer });
  } catch (error) {
    return next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { isOnline } = req.body || {};
    const astrologer = await Astrologer.findOneAndUpdate(
      { userId: req.user.id },
      { isOnline: Boolean(isOnline) },
      { new: true }
    );
    if (!astrologer) throw new AppError("Astrologer profile not found.", 404);
    return res.json({ success: true, data: astrologer });
  } catch (error) {
    return next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const astrologer = await Astrologer.findOne({ userId: req.user.id }).lean();
    if (!astrologer) throw new AppError("Astrologer profile not found.", 404);

    return res.json({
      success: true,
      data: {
        astrologer,
        earnings: astrologer.totalEarnings,
        balance: astrologer.walletBalance,
        rating: astrologer.rating,
        reviewsCount: astrologer.reviewsCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerAstrologer,
  getAstrologerList,
  getAstrologerById,
  updateStatus,
  getDashboard,
};
