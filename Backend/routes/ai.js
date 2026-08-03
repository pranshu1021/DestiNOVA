const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getHistory, postMessage } = require("../controllers/aiController");

const router = express.Router();

router.get("/history", protect, getHistory);
router.post("/chat", protect, postMessage);

module.exports = router;
