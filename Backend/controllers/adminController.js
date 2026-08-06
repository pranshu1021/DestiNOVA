const Astrologer = require("../models/Astrologer");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const AppError = require("../utils/AppError");

const getPendingAstrologers = async (req, res, next) => {
  try {
    const pending = await Astrologer.find({ isApproved: false }).lean();
    return res.json({ success: true, data: pending });
  } catch (error) {
    return next(error);
  }
};

const approveAstrologer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approve } = req.body || {};

    const astrologer = await Astrologer.findByIdAndUpdate(
      id,
      { isApproved: approve !== false },
      { new: true }
    );

    if (!astrologer) throw new AppError("Astrologer not found.", 404);
    return res.json({ success: true, message: `Astrologer ${approve ? "approved" : "rejected"}`, data: astrologer });
  } catch (error) {
    return next(error);
  }
};

const suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { suspend } = req.body || {};

    const user = await User.findByIdAndUpdate(
      id,
      { isSuspended: Boolean(suspend) },
      { new: true }
    ).select("-password");

    if (!user) throw new AppError("User not found.", 404);
    return res.json({ success: true, message: `User account ${suspend ? "suspended" : "activated"}`, data: user });
  } catch (error) {
    return next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).limit(50).lean();
    return res.json({ success: true, data: users });
  } catch (error) {
    return next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(50).lean();
    return res.json({ success: true, data: transactions });
  } catch (error) {
    return next(error);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAstrologers = await Astrologer.countDocuments({ isApproved: true });
    const pendingAstrologers = await Astrologer.countDocuments({ isApproved: false });
    const totalRevenueResult = await Transaction.aggregate([
      { $match: { category: "RECHARGE", status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalAstrologers,
        pendingAstrologers,
        totalRevenue,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPendingAstrologers,
  approveAstrologer,
  suspendUser,
  getAllUsers,
  getAllTransactions,
  getAdminStats,
};
