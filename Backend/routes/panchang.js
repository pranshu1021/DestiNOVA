const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getPanchang } = require("../controllers/panchangController");

const router = express.Router();

router.get("/", protect, getPanchang);

module.exports = router;
