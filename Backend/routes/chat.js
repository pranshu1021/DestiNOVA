const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getConversations, getMessagesForSession, markMessagesSeen } = require("../controllers/chatController");

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/session/:sessionId", protect, getMessagesForSession);
router.post("/seen", protect, markMessagesSeen);

module.exports = router;
