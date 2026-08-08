const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getBalance, createOrder, verifyPayment, markPaymentFailed } = require("../controllers/walletController");

const router = express.Router();

router.get("/balance", protect, getBalance);
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/payment-failed", protect, markPaymentFailed);

module.exports = router;
