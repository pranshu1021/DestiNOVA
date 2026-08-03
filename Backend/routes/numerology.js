const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getNumerology } = require("../controllers/numerologyController");

const router = express.Router();

router.get("/", protect, getNumerology);

module.exports = router;
