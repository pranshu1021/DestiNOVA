const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getMuhurat } = require("../controllers/muhuratController");

const router = express.Router();

router.get("/", protect, getMuhurat);

module.exports = router;
