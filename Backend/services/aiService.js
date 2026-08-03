const mongoose = require("mongoose");
const User = require("../models/User");
const ChatHistory = require("../models/ChatHistory");
const { generateAstrologyReply } = require("./geminiService");
const AppError = require("../utils/AppError");

const getChatHistory = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) throw new AppError("Invalid user identity.", 401);
  let history = await ChatHistory.findOne({ userId }).lean();
  if (!history) {
    history = await ChatHistory.create({ userId, messages: [] });
  }
  return history.messages || [];
};

const sendMessage = async (userId, userText) => {
  if (!mongoose.isValidObjectId(userId)) throw new AppError("Invalid user identity.", 401);
  if (!userText || typeof userText !== "string" || !userText.trim()) {
    throw new AppError("Message text is required.", 400);
  }

  const user = await User.findById(userId).select("fullName gender dateOfBirth birthTime birthPlace").lean();
  if (!user) throw new AppError("User not found.", 404);

  let history = await ChatHistory.findOne({ userId });
  if (!history) {
    history = new ChatHistory({ userId, messages: [] });
  }

  const assistantReply = await generateAstrologyReply(user, history.messages, userText.trim());

  const userMsg = { role: "user", text: userText.trim(), timestamp: new Date() };
  const assistantMsg = { role: "assistant", text: assistantReply, timestamp: new Date() };

  history.messages.push(userMsg, assistantMsg);
  await history.save();

  return {
    messages: history.messages,
    latestReply: assistantMsg,
  };
};

module.exports = {
  getChatHistory,
  sendMessage,
};
