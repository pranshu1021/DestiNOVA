const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
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
    const messages = await ChatMessage.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const sessions = new Map();

    for (const message of messages) {
      if (!sessions.has(message.sessionId)) {
        const partnerId = getConversationPartnerId(message, userId);
        const partner = partnerId ? await User.findById(partnerId).lean() : null;
        sessions.set(message.sessionId, {
          sessionId: message.sessionId,
          partnerId,
          partnerName: partner?.fullName || partner?.name || "Unknown",
          partnerPhoto: partner?.photo || partner?.profilePhoto || "",
          lastMessage: message.text || "New message",
          lastMessageAt: message.createdAt,
          unreadCount: 0,
          status: "ACTIVE",
        });
      }

      const entry = sessions.get(message.sessionId);
      entry.lastMessage = message.text || "New message";
      entry.lastMessageAt = message.createdAt;
      if (message.receiverId?.toString() === userId && !message.isSeen) {
        entry.unreadCount += 1;
      }
    }

    const conversations = Array.from(sessions.values()).sort((a, b) => {
      return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
    });

    return res.json({ success: true, data: conversations });
  } catch (error) {
    return next(error);
  }
};

const getMessagesForSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

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
