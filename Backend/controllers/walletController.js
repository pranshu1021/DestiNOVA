const walletService = require("../services/walletService");
const Transaction = require("../models/Transaction");

const getBalance = async (req, res, next) => {
  try {
    const wallet = await walletService.getOrCreateWallet(req.user.id);
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json({
      success: true,
      data: {
        balance: wallet.balance,
        currency: wallet.currency,
        transactions,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body || {};
    const orderData = await walletService.createRazorpayOrder(req.user.id, Number(amount));
    return res.json({ success: true, data: orderData });
  } catch (error) {
    return next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const result = await walletService.verifyPaymentAndRecharge(req.user.id, req.body || {});
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

const deductCredits = async (req, res, next) => {
  try {
    const { minutes, costPerMinute, category } = req.body || {};
    const result = await walletService.deductCreditsForSession(
      req.user.id,
      Number(minutes || 1),
      Number(costPerMinute || 15),
      category || "CHAT_DEDUCTION"
    );
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getBalance,
  createOrder,
  verifyPayment,
  deductCredits,
};
