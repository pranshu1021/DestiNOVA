const express = require("express");
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const {
  getPendingAstrologers,
  approveAstrologer,
  suspendUser,
  getAllUsers,
  getAllTransactions,
  getAllSessions,
  getAdminStats,
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, requireAdmin);
router.get("/stats", getAdminStats);
router.get("/astrologers/pending", getPendingAstrologers);
router.put("/astrologers/:id/approve", approveAstrologer);
router.put("/users/:id/suspend", suspendUser);
router.get("/users", getAllUsers);
router.get("/transactions", getAllTransactions);
router.get("/sessions", getAllSessions);

module.exports = router;
