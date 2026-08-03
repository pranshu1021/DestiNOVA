const aiService = require("../services/aiService");

const getHistory = async (req, res, next) => {
  try {
    const messages = await aiService.getChatHistory(req.user.id);
    return res.json({ success: true, data: messages });
  } catch (error) {
    return next(error);
  }
};

const postMessage = async (req, res, next) => {
  try {
    const { message } = req.body || {};
    const result = await aiService.sendMessage(req.user.id, message);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getHistory,
  postMessage,
};
