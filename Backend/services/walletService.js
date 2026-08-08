const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const config = require("../config");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const razorpay = new Razorpay({ key_id: config.razorpayKeyId, key_secret: config.razorpayKeySecret });
const MINIMUM_RECHARGE = 10;
const PLATFORM_COMMISSION_PERCENT = Number(process.env.PLATFORM_COMMISSION_PERCENT || 20);

const getOrCreateWallet = async (userId, session) => {
  await Wallet.updateOne({ userId }, { $setOnInsert: { userId, balance: 100, currency: "INR" } }, { upsert: true, session });
  return Wallet.findOne({ userId }).session(session || null);
};

const createRazorpayOrder = async (userId, amount) => {
  if (!Number.isFinite(amount) || amount < MINIMUM_RECHARGE || !Number.isInteger(amount)) {
    throw new AppError(`Recharge amount must be a whole number of at least INR ${MINIMUM_RECHARGE}.`, 400);
  }
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `wallet_${userId.toString().slice(-8)}_${Date.now()}`,
    notes: { userId: String(userId), purpose: "wallet_recharge" },
  });
  await Transaction.create({ userId, amount, type: "CREDIT", category: "RECHARGE", status: "PENDING", razorpayOrderId: order.id, description: `Wallet recharge order for INR ${amount}` });
  logger.info("wallet.order.created", { userId: String(userId), orderId: order.id, amount });
  return { orderId: order.id, amount: order.amount, currency: order.currency, keyId: config.razorpayKeyId };
};

const verifyPaymentAndRecharge = async (userId, payment) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = payment || {};
  if (![razorpayOrderId, razorpayPaymentId, razorpaySignature].every((value) => typeof value === "string" && value)) throw new AppError("Invalid payment verification payload.", 400);
  const expected = crypto.createHmac("sha256", config.razorpayKeySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(razorpaySignature);
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) throw new AppError("Payment signature verification failed.", 400);

  const dbSession = await mongoose.startSession();
  try {
    let result;
    await dbSession.withTransaction(async () => {
      const transaction = await Transaction.findOne({ razorpayOrderId, userId }).session(dbSession);
      if (!transaction) throw new AppError("Payment order not found.", 404);
      if (transaction.status === "SUCCESS") {
        const wallet = await getOrCreateWallet(userId, dbSession);
        result = { walletBalance: wallet.balance, transaction, alreadyProcessed: true };
        return;
      }
      if (transaction.status !== "PENDING") throw new AppError("Payment cannot be verified in its current state.", 409);
      transaction.status = "SUCCESS";
      transaction.razorpayPaymentId = razorpayPaymentId;
      transaction.razorpaySignature = razorpaySignature;
      await transaction.save({ session: dbSession });
      const wallet = await Wallet.findOneAndUpdate({ userId }, { $inc: { balance: transaction.amount }, $setOnInsert: { userId, currency: "INR" } }, { new: true, upsert: true, session: dbSession });
      result = { walletBalance: wallet.balance, transaction, alreadyProcessed: false };
    });
    logger.info("wallet.payment.verified", { userId: String(userId), orderId: razorpayOrderId, alreadyProcessed: result.alreadyProcessed });
    return result;
  } finally { await dbSession.endSession(); }
};

const markPaymentFailed = async (userId, razorpayOrderId, reason = "Payment cancelled or failed") => {
  const transaction = await Transaction.findOneAndUpdate({ userId, razorpayOrderId, status: "PENDING" }, { $set: { status: "FAILED", description: reason } }, { new: true });
  return transaction;
};

const billConsultationMinute = async (consultation, billedAt) => {
  const amount = consultation.pricePerMinute;
  const billingKey = `${consultation._id}:${billedAt.toISOString()}`;
  const category = consultation.sessionType === "chat" ? "CHAT_DEDUCTION" : "CALL_DEDUCTION";
  const commission = Number((amount * PLATFORM_COMMISSION_PERCENT / 100).toFixed(2));
  const earning = Number((amount - commission).toFixed(2));
  const dbSession = await mongoose.startSession();
  try {
    await dbSession.withTransaction(async () => {
      const existing = await Transaction.findOne({ billingKey: `${billingKey}:customer` }).session(dbSession);
      if (existing) return;
      await getOrCreateWallet(consultation.customerId, dbSession);
      const customerWallet = await Wallet.findOneAndUpdate(
        { userId: consultation.customerId, balance: { $gte: amount } },
        { $inc: { balance: -amount }, $setOnInsert: { userId: consultation.customerId, currency: "INR" } },
        { new: true, upsert: false, session: dbSession }
      );
      if (!customerWallet) throw new AppError("Insufficient wallet balance.", 402);
      await Transaction.create([{ userId: consultation.customerId, amount, type: "DEBIT", category, status: "SUCCESS", sessionId: String(consultation._id), customerId: consultation.customerId, astrologerId: consultation.astrologerId, platformCommission: commission, billingKey: `${billingKey}:customer`, description: "Consultation minute charge" }], { session: dbSession });
      const astrologer = await Astrologer.findByIdAndUpdate(consultation.astrologerId, { $inc: { walletBalance: earning, totalEarnings: earning } }, { new: true, session: dbSession });
      await Transaction.create([{ userId: astrologer.userId, amount: earning, type: "CREDIT", category: "SESSION_EARNING", status: "SUCCESS", sessionId: String(consultation._id), customerId: consultation.customerId, astrologerId: consultation.astrologerId, counterpartyId: consultation.customerId, platformCommission: commission, billingKey: `${billingKey}:astrologer`, description: "Astrologer consultation earning" }], { session: dbSession });
      await require("../models/ConsultationSession").findByIdAndUpdate(consultation._id, { $inc: { totalAmount: amount, platformCommission: commission, astrologerEarning: earning } }, { session: dbSession });
    });
  } finally { await dbSession.endSession(); }
};

module.exports = { getOrCreateWallet, createRazorpayOrder, verifyPaymentAndRecharge, markPaymentFailed, billConsultationMinute };
