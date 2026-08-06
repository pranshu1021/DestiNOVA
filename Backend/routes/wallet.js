const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getBalance, createOrder, verifyPayment, deductCredits } = require("../controllers/walletController");

const router = express.Router();

router.get("/balance", protect, getBalance);
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/deduct", protect, deductCredits);

module.exports = router;
