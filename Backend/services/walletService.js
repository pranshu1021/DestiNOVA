const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const crypto = require("crypto");
const AppError = require("../utils/AppError");

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 100 });
  }
  return wallet;
};

const createRazorpayOrder = async (userId, amount) => {
  if (!amount || amount < 10) {
    throw new AppError("Minimum recharge amount is ₹10.", 400);
  }

  const Razorpay = require("razorpay");
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_destinova";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "destinova_secret";

  const instance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const options = {
    amount: amount * 100, // paise
    currency: "INR",
    receipt: `rcpt_${userId.toString().slice(-6)}_${Date.now()}`,
  };

  try {
    const order = await instance.orders.create(options);
    await Transaction.create({
      userId,
      amount,
      type: "CREDIT",
      category: "RECHARGE",
      status: "PENDING",
      razorpayOrderId: order.id,
      description: `Recharge Order ₹${amount}`,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    };
  } catch (err) {
    // Development fallback mock order if keys are unconfigured
    const mockOrderId = `order_mock_${Date.now()}`;
    await Transaction.create({
      userId,
      amount,
      type: "CREDIT",
      category: "RECHARGE",
      status: "PENDING",
      razorpayOrderId: mockOrderId,
      description: `Mock Recharge Order ₹${amount}`,
    });
    return {
      orderId: mockOrderId,
      amount: amount * 100,
      currency: "INR",
      keyId,
    };
  }
};

const verifyPaymentAndRecharge = async (userId, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const transaction = await Transaction.findOne({ razorpayOrderId, userId });
  if (!transaction) {
    throw new AppError("Transaction order not found.", 404);
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET || "destinova_secret";
  if (razorpaySignature && !razorpayOrderId.startsWith("order_mock")) {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      transaction.status = "FAILED";
      await transaction.save();
      throw new AppError("Invalid payment signature verification.", 400);
    }
  }

  transaction.status = "SUCCESS";
  transaction.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
  transaction.razorpaySignature = razorpaySignature || "mock_sig";
  await transaction.save();

  const wallet = await getOrCreateWallet(userId);
  wallet.balance += transaction.amount;
  await wallet.save();

  return { walletBalance: wallet.balance, transaction };
};

const deductCreditsForSession = async (userId, minutes, costPerMinute, category = "CHAT_DEDUCTION") => {
  const totalCost = minutes * costPerMinute;
  const wallet = await getOrCreateWallet(userId);

  if (wallet.balance < totalCost) {
    throw new AppError("Insufficient wallet balance. Please recharge.", 402);
  }

  wallet.balance -= totalCost;
  await wallet.save();

  const transaction = await Transaction.create({
    userId,
    amount: totalCost,
    type: "DEBIT",
    category,
    status: "SUCCESS",
    description: `Deducted ${totalCost} for ${minutes} min session (@ ₹${costPerMinute}/min)`,
  });

  return { walletBalance: wallet.balance, transaction };
};

const refundSessionCost = async (userId, amount, reason = "Failed session") => {
  const wallet = await getOrCreateWallet(userId);
  wallet.balance += amount;
  await wallet.save();

  const transaction = await Transaction.create({
    userId,
    amount,
    type: "REFUND",
    category: "REFUND",
    status: "SUCCESS",
    description: `Refunded ₹${amount} due to: ${reason}`,
  });

  return { walletBalance: wallet.balance, transaction };
};

module.exports = {
  getOrCreateWallet,
  createRazorpayOrder,
  verifyPaymentAndRecharge,
  deductCreditsForSession,
  refundSessionCost,
};
