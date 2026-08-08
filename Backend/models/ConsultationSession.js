const mongoose = require("mongoose");

const consultationSessionSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer", required: true, index: true },
    sessionType: { type: String, enum: ["chat", "voice", "video"], required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "ACTIVE", "REJECTED", "ENDED"], default: "PENDING", index: true },
    pricePerMinute: { type: Number, required: true, min: 1 },
    startedAt: Date,
    endedAt: Date,
    lastBilledAt: Date,
    durationSeconds: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, default: 0, min: 0 },
    platformCommission: { type: Number, default: 0, min: 0 },
    astrologerEarning: { type: Number, default: 0, min: 0 },
    endReason: { type: String, default: "" },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      text: { type: String, trim: true, maxlength: 1000 },
      createdAt: Date,
    },
  },
  { timestamps: true }
);

consultationSessionSchema.index(
  { customerId: 1, astrologerId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["PENDING", "ACCEPTED", "ACTIVE"] } } }
);
consultationSessionSchema.index({ astrologerId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("ConsultationSession", consultationSessionSchema);
