const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  registerAstrologer,
  getAstrologerList,
  getAstrologerById,
  updateStatus,
  getDashboard,
  updateProfile,
} = require("../controllers/astrologerController");

const router = express.Router();

router.get("/list", getAstrologerList);
router.get("/dashboard", protect, getDashboard);
router.get("/:id", getAstrologerById);
router.post("/register", protect, registerAstrologer);
router.put("/status", protect, updateStatus);
router.put("/profile", protect, updateProfile);

module.exports = router;
