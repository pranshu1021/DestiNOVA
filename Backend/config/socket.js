const { Server } = require("socket.io");
const ChatMessage = require("../models/ChatMessage");
const Astrologer = require("../models/Astrologer");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_room", ({ sessionId, userId }) => {
      socket.join(sessionId);
      if (userId) socket.join(userId);
      console.log(`User ${userId} joined room ${sessionId}`);
    });

    socket.on("request_chat", async (payload) => {
      try {
        const { customerId, astrologerId, sessionId, pricePerMinute, customerName, astrologerName } = payload || {};
        const customer = await User.findById(customerId).lean();
        const astrologer = await Astrologer.findById(astrologerId).lean();
        if (!customer || !astrologer) return;
        if (customerId === astrologer?.userId?.toString()) {
          io.to(customerId).emit("chat_request_error", { message: "You cannot start a chat with yourself." });
          return;
        }
        if (!astrologer.isOnline) {
          io.to(customerId).emit("chat_request_error", { message: "Astrologer is currently offline." });
          return;
        }
        const wallet = await Wallet.findOne({ userId: customerId }).lean();
        if (!wallet || wallet.balance < Number(pricePerMinute || 0)) {
          io.to(customerId).emit("chat_request_error", { message: "Insufficient wallet balance to start a chat." });
          return;
        }
        io.to(astrologer?.userId?.toString()).emit("incoming_chat_request", {
          sessionId,
          customerId,
          astrologerId,
          pricePerMinute,
          customerName,
          astrologerName,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.log("Socket request_chat error:", error.message);
      }
    });

    socket.on("accept_chat_request", async (payload) => {
      try {
        const { sessionId, customerId, astrologerId } = payload || {};
        io.to(customerId).emit("chat_request_accepted", { sessionId, astrologerId });
        io.to(astrologerId).emit("chat_started", { sessionId, customerId });
        io.to(sessionId).emit("chat_session_ready", { sessionId, customerId, astrologerId });
      } catch (error) {
        console.log("Socket accept_chat_request error:", error.message);
      }
    });

    socket.on("reject_chat_request", async (payload) => {
      try {
        const { sessionId, customerId } = payload || {};
        io.to(customerId).emit("chat_request_rejected", { sessionId, message: "Astrologer is unavailable right now." });
      } catch (error) {
        console.log("Socket reject_chat_request error:", error.message);
      }
    });

    socket.on("end_chat_session", async (payload) => {
      try {
        const { sessionId, userId } = payload || {};
        io.to(sessionId).emit("chat_session_ended", { sessionId, userId });
      } catch (error) {
        console.log("Socket end_chat_session error:", error.message);
      }
    });

    // 1-to-1 Real-time Chat
    socket.on("send_message", async (data) => {
      const { sessionId, senderId, receiverId, text, imageUrl, voiceUrl } = data || {};
      try {
        const msg = await ChatMessage.create({
          sessionId,
          senderId,
          receiverId,
          text,
          imageUrl: imageUrl || "",
          voiceUrl: voiceUrl || "",
        });

        io.to(sessionId).emit("receive_message", msg);
      } catch (err) {
        console.log("Socket send_message error:", err.message);
      }
    });

    // Typing Indicators & Read Receipts
    socket.on("typing", ({ sessionId, userId, isTyping }) => {
      socket.to(sessionId).emit("user_typing", { userId, isTyping });
    });

    socket.on("message_seen", async ({ sessionId, messageId, receiverId }) => {
      try {
        await ChatMessage.findByIdAndUpdate(messageId, { isSeen: true, seenAt: new Date() });
        io.to(sessionId).emit("message_seen_update", { messageId, receiverId });
      } catch (err) {
        console.log("Socket message_seen error:", err.message);
      }
    });

    // WebRTC Audio/Video Call Signaling Architecture
    socket.on("call_offer", ({ to, offer, from, callType }) => {
      io.to(to).emit("incoming_call", { offer, from, callType });
    });

    socket.on("call_answer", ({ to, answer }) => {
      io.to(to).emit("call_accepted", { answer });
    });

    socket.on("ice_candidate", ({ to, candidate }) => {
      io.to(to).emit("ice_candidate", { candidate });
    });

    socket.on("end_call", ({ to }) => {
      io.to(to).emit("call_ended");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized.");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
