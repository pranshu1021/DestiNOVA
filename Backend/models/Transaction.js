const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT", "REFUND"],
      required: true,
    },
    category: {
      type: String,
      enum: ["RECHARGE", "CHAT_DEDUCTION", "CALL_DEDUCTION", "SESSION_EARNING", "REFUND"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
    description: {
      type: String,
      default: "",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    razorpaySignature: { type: String },
    sessionId: { type: String, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer", index: true },
    counterpartyId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    platformCommission: { type: Number, default: 0 },
    billingKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

transactionSchema.index({ razorpayOrderId: 1, userId: 1 }, { unique: true, sparse: true });
transactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
