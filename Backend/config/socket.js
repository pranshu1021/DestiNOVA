const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const ChatMessage = require("../models/ChatMessage");
const config = require(".");
const logger = require("../utils/logger");
const { assertParticipant, acceptRequest, rejectRequest, endSession } = require("../services/consultationService");

let io;

const emitError = (socket, message) => socket.emit("session_error", { message });

const initSocket = (server) => {
  io = new Server(server, { cors: { origin: config.corsOrigins, methods: ["GET", "POST"] } });
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
      if (!payload?.id) throw new Error("Invalid token");
      socket.userId = String(payload.id);
      return next();
    } catch (_) { return next(new Error("Authentication required")); }
  });
  io.on("connection", (socket) => {
    socket.join(socket.userId);
    socket.on("join_room", async ({ sessionId }, callback) => {
      try {
        await assertParticipant(sessionId, socket.userId);
        socket.join(String(sessionId));
        callback?.({ success: true });
      } catch (error) { emitError(socket, error.message); callback?.({ success: false, message: error.message }); }
    });
    socket.on("send_message", async ({ sessionId, text = "", imageUrl = "", voiceUrl = "" }, callback) => {
      try {
        const { session, isCustomer } = await assertParticipant(sessionId, socket.userId);
        if (session.status !== "ACTIVE") throw new Error("This consultation is not active.");
        if (!String(text).trim() && !imageUrl && !voiceUrl) throw new Error("Message cannot be empty.");
        const astrologer = await require("../models/Astrologer").findById(session.astrologerId).select("userId");
        const receiverId = isCustomer ? astrologer.userId : session.customerId;
        const message = await ChatMessage.create({ sessionId: String(session._id), senderId: socket.userId, receiverId, text: String(text).trim(), imageUrl, voiceUrl });
        io.to(String(session._id)).emit("receive_message", message);
        io.to(String(receiverId)).emit("new_message", { sessionId: String(session._id), message });
        callback?.({ success: true, message });
      } catch (error) { emitError(socket, error.message); callback?.({ success: false, message: error.message }); }
    });
    socket.on("typing", async ({ sessionId, isTyping }) => {
      try { await assertParticipant(sessionId, socket.userId); socket.to(String(sessionId)).emit("user_typing", { userId: socket.userId, isTyping: Boolean(isTyping) }); } catch (_) {}
    });
    socket.on("message_seen", async ({ sessionId, messageId }) => {
      try {
        await assertParticipant(sessionId, socket.userId);
        const message = await ChatMessage.findOneAndUpdate({ _id: messageId, sessionId: String(sessionId), receiverId: socket.userId }, { isSeen: true, seenAt: new Date() }, { new: true });
        if (message) io.to(String(sessionId)).emit("message_seen_update", { messageId: String(message._id), receiverId: socket.userId });
      } catch (_) {}
    });
    socket.on("accept_chat_request", async ({ sessionId }, callback) => {
      try { const session = await acceptRequest(sessionId, socket.userId); io.to(String(session.customerId)).emit("consultation_accepted", { session: session.toObject() }); io.to(String(session._id)).emit("session_started", { session: session.toObject() }); callback?.({ success: true, session }); } catch (error) { emitError(socket, error.message); callback?.({ success: false, message: error.message }); }
    });
    socket.on("reject_chat_request", async ({ sessionId }, callback) => {
      try { const session = await rejectRequest(sessionId, socket.userId); io.to(String(session.customerId)).emit("consultation_rejected", { session: session.toObject() }); callback?.({ success: true }); } catch (error) { emitError(socket, error.message); callback?.({ success: false, message: error.message }); }
    });
    socket.on("end_chat_session", async ({ sessionId }, callback) => {
      try { const session = await endSession(sessionId, socket.userId); io.to(String(session._id)).emit("session_ended", { session: session.toObject() }); callback?.({ success: true }); } catch (error) { emitError(socket, error.message); callback?.({ success: false, message: error.message }); }
    });
    // Signaling data stays opaque, but its room and participants are authenticated.
    ["call_offer", "call_answer", "ice_candidate", "end_call"].forEach((event) => socket.on(event, async ({ sessionId, ...payload }) => {
      try { await assertParticipant(sessionId, socket.userId); socket.to(String(sessionId)).emit(event === "call_offer" ? "incoming_call" : event === "call_answer" ? "call_accepted" : event === "end_call" ? "call_ended" : "ice_candidate", { ...payload, from: socket.userId, sessionId: String(sessionId) }); } catch (_) {}
    }));
    socket.on("disconnect", () => logger.info("socket.disconnected", { socketId: socket.id, userId: socket.userId }));
  });
  return io;
};

const getIO = () => { if (!io) throw new Error("Socket.io not initialized."); return io; };
module.exports = { initSocket, getIO };
