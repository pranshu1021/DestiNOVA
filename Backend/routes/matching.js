const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getMatching } = require("../controllers/matchingController");

const router = express.Router();

router.post("/", protect, getMatching);

module.exports = router;
