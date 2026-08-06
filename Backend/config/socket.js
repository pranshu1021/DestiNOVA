const { Server } = require("socket.io");
const ChatMessage = require("../models/ChatMessage");

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

    // Join real-time room
    socket.on("join_room", ({ sessionId, userId }) => {
      socket.join(sessionId);
      if (userId) socket.join(userId);
      console.log(`User ${userId} joined room ${sessionId}`);
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
