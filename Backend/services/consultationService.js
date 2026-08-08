const mongoose = require("mongoose");
const Astrologer = require("../models/Astrologer");
const ConsultationSession = require("../models/ConsultationSession");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const { billConsultationMinute } = require("./walletService");

const LIVE_STATUSES = ["PENDING", "ACCEPTED", "ACTIVE"];

const getAstrologerForUser = (userId) => Astrologer.findOne({ userId, isApproved: true });

const assertParticipant = async (sessionId, userId) => {
  if (!mongoose.isValidObjectId(sessionId)) throw new AppError("Invalid consultation session.", 400);
  const session = await ConsultationSession.findById(sessionId);
  if (!session) throw new AppError("Consultation session not found.", 404);
  const astrologer = await Astrologer.findById(session.astrologerId).select("userId");
  const isCustomer = session.customerId.toString() === String(userId);
  const isAstrologer = astrologer?.userId?.toString() === String(userId);
  if (!isCustomer && !isAstrologer) throw new AppError("You cannot access this consultation.", 403);
  return { session, astrologer, isCustomer, isAstrologer };
};

const serializeSession = (session) => session.toObject ? session.toObject() : session;

const createRequest = async (customerId, { astrologerId, sessionType }) => {
  if (!mongoose.isValidObjectId(astrologerId) || !["chat", "voice", "video"].includes(sessionType)) {
    throw new AppError("A valid astrologer and consultation type are required.", 400);
  }
  const astrologer = await Astrologer.findOne({ _id: astrologerId, isApproved: true });
  if (!astrologer) throw new AppError("Astrologer is unavailable.", 404);
  if (astrologer.userId.toString() === String(customerId)) throw new AppError("You cannot start a consultation with yourself.", 400);
  if (!astrologer.isOnline) throw new AppError("Astrologer is currently offline.", 409);
  const duplicate = await ConsultationSession.findOne({ customerId, astrologerId, status: { $in: LIVE_STATUSES } });
  if (duplicate) return { session: duplicate, alreadyExists: true };
  const pricePerMinute = sessionType === "chat" ? astrologer.chatPricePerMinute : astrologer.callPricePerMinute;
  const session = await ConsultationSession.create({ customerId, astrologerId, sessionType, pricePerMinute });
  logger.info("consultation.requested", { sessionId: String(session._id), customerId: String(customerId), astrologerId: String(astrologerId), sessionType });
  return { session, alreadyExists: false };
};

const acceptRequest = async (sessionId, userId) => {
  const { session, isAstrologer } = await assertParticipant(sessionId, userId);
  if (!isAstrologer) throw new AppError("Only the assigned astrologer can accept this request.", 403);
  if (session.status !== "PENDING") throw new AppError("This consultation is no longer pending.", 409);
  const now = new Date();
  session.status = "ACTIVE";
  session.startedAt = now;
  session.lastBilledAt = now;
  await session.save();
  return session;
};

const rejectRequest = async (sessionId, userId) => {
  const { session, isAstrologer } = await assertParticipant(sessionId, userId);
  if (!isAstrologer) throw new AppError("Only the assigned astrologer can reject this request.", 403);
  if (session.status !== "PENDING") throw new AppError("This consultation is no longer pending.", 409);
  session.status = "REJECTED";
  session.endedAt = new Date();
  await session.save();
  return session;
};

const endSession = async (sessionId, userId, reason = "ended_by_participant") => {
  const { session } = await assertParticipant(sessionId, userId);
  if (session.status === "ENDED" || session.status === "REJECTED") return session;
  if (session.status !== "ACTIVE") throw new AppError("Only an active consultation can be ended.", 409);
  const now = new Date();
  session.durationSeconds = Math.max(session.durationSeconds, Math.floor((now - session.startedAt) / 1000));
  session.status = "ENDED";
  session.endedAt = now;
  session.endReason = reason;
  await session.save();
  return session;
};

const billDueSession = async (sessionId, now = new Date()) => {
  const session = await ConsultationSession.findOne({ _id: sessionId, status: "ACTIVE" });
  if (!session || !session.lastBilledAt) return null;
  const elapsedMinutes = Math.floor((now - session.lastBilledAt) / 60000);
  if (elapsedMinutes < 1) return session;
  for (let minute = 0; minute < elapsedMinutes; minute += 1) {
    const billAt = new Date(session.lastBilledAt.getTime() + 60000);
    try {
      await billConsultationMinute(session, billAt);
      session.lastBilledAt = billAt;
      session.durationSeconds = Math.floor((billAt - session.startedAt) / 1000);
      await session.save();
    } catch (error) {
      if (error.statusCode === 402) return endSession(session._id, session.customerId, "insufficient_balance");
      throw error;
    }
  }
  return session;
};

const billActiveSessions = async () => {
  const sessions = await ConsultationSession.find({ status: "ACTIVE" }).select("_id").lean();
  await Promise.allSettled(sessions.map(({ _id }) => billDueSession(_id).catch((error) => logger.error("consultation.billing.failed", { sessionId: String(_id), message: error.message }))));
};

const getSessionsForUser = async (userId, status) => {
  const astrologer = await getAstrologerForUser(userId);
  const query = astrologer ? { astrologerId: astrologer._id } : { customerId: userId };
  if (status) query.status = status;
  return ConsultationSession.find(query)
    .populate("customerId", "fullName photo")
    .populate({ path: "astrologerId", select: "fullName profilePhoto rating isOnline", populate: { path: "userId", select: "fullName photo" } })
    .sort({ updatedAt: -1 })
    .lean();
};

const addReview = async (sessionId, userId, rating, text) => {
  const { session, isCustomer } = await assertParticipant(sessionId, userId);
  if (!isCustomer) throw new AppError("Only the customer can submit a review.", 403);
  if (session.status !== "ENDED") throw new AppError("Reviews can only be submitted after a completed consultation.", 409);
  if (session.review?.rating) throw new AppError("A review has already been submitted for this consultation.", 409);
  session.review = { rating, text: text || "", createdAt: new Date() };
  await session.save();
  const stats = await ConsultationSession.aggregate([{ $match: { astrologerId: session.astrologerId, "review.rating": { $exists: true } } }, { $group: { _id: null, rating: { $avg: "$review.rating" }, reviewsCount: { $sum: 1 } } }]);
  await Astrologer.findByIdAndUpdate(session.astrologerId, { rating: Number((stats[0]?.rating || 0).toFixed(2)), reviewsCount: stats[0]?.reviewsCount || 0 });
  return session;
};

module.exports = { createRequest, acceptRequest, rejectRequest, endSession, assertParticipant, getSessionsForUser, billDueSession, billActiveSessions, addReview, serializeSession };
