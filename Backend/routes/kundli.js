const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getKundli } = require("../controllers/kundliController");

const router = express.Router();

router.get("/", protect, getKundli);

module.exports = router;
