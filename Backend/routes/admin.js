const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getPendingAstrologers,
  approveAstrologer,
  suspendUser,
  getAllUsers,
  getAllTransactions,
  getAdminStats,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/stats", protect, getAdminStats);
router.get("/astrologers/pending", protect, getPendingAstrologers);
router.put("/astrologers/:id/approve", protect, approveAstrologer);
router.put("/users/:id/suspend", protect, suspendUser);
router.get("/users", protect, getAllUsers);
router.get("/transactions", protect, getAllTransactions);

module.exports = router;
