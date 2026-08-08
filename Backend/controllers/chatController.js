const ChatMessage = require("../models/ChatMessage");
const ConsultationSession = require("../models/ConsultationSession");
const AppError = require("../utils/AppError");

const getConversationPartnerId = (message, userId) => {
  const senderId = message.senderId?.toString();
  const receiverId = message.receiverId?.toString();
  const currentUserId = userId?.toString();

  if (senderId === currentUserId) return receiverId;
  if (receiverId === currentUserId) return senderId;
  return null;
};

const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessions = await ConsultationSession.find({ customerId: userId }).populate("astrologerId", "fullName profilePhoto userId isOnline").sort({ updatedAt: -1 }).lean();
    const astrologer = await require("../models/Astrologer").findOne({ userId }).lean();
    const ownedSessions = astrologer ? await ConsultationSession.find({ astrologerId: astrologer._id }).populate("customerId", "fullName photo").sort({ updatedAt: -1 }).lean() : sessions;
    const conversations = await Promise.all(ownedSessions.map(async (session) => {
      const isAstrologer = Boolean(astrologer);
      const partner = isAstrologer ? session.customerId : session.astrologerId;
      const [lastMessage, unreadCount] = await Promise.all([ChatMessage.findOne({ sessionId: String(session._id) }).sort({ createdAt: -1 }).lean(), ChatMessage.countDocuments({ sessionId: String(session._id), receiverId: userId, isSeen: false })]);
      return { sessionId: String(session._id), partnerId: String(isAstrologer ? session.customerId._id : session.astrologerId.userId), partnerName: partner?.fullName || "Unknown", partnerPhoto: partner?.photo || partner?.profilePhoto || "", lastMessage: lastMessage?.text || (session.status === "PENDING" ? "Consultation requested" : "No messages yet"), lastMessageAt: lastMessage?.createdAt || session.updatedAt, unreadCount, status: session.status, sessionType: session.sessionType, pricePerMinute: session.pricePerMinute };
    }));

    return res.json({ success: true, data: conversations });
  } catch (error) {
    return next(error);
  }
};

const getMessagesForSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const { assertParticipant } = require("../services/consultationService");
    await assertParticipant(sessionId, userId);
    const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 }).lean();
    if (!messages.length) {
      return res.json({ success: true, data: [] });
    }

    const incomingMessageIds = messages
      .filter((message) => message.receiverId?.toString() === userId && !message.isSeen)
      .map((message) => message._id);

    if (incomingMessageIds.length) {
      await ChatMessage.updateMany(
        { _id: { $in: incomingMessageIds } },
        { $set: { isSeen: true, seenAt: new Date() } }
      );
    }

    return res.json({ success: true, data: messages });
  } catch (error) {
    return next(error);
  }
};

const markMessagesSeen = async (req, res, next) => {
  try {
    const { sessionId, messageIds = [] } = req.body || {};
    const userId = req.user.id;

    if (!sessionId || !messageIds.length) {
      throw new AppError("Invalid payload.", 400);
    }

    const { assertParticipant } = require("../services/consultationService");
    await assertParticipant(sessionId, userId);
    const result = await ChatMessage.updateMany(
      {
        _id: { $in: messageIds },
        receiverId: userId,
        sessionId,
      },
      { $set: { isSeen: true, seenAt: new Date() } }
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getConversations,
  getMessagesForSession,
  markMessagesSeen,
};
