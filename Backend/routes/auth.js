const express = require("express");

const router = express.Router();

const { signup,googleLogin, login, getProfile,updateProfile} = require("../controllers/authControllers");
const protect = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { authSignupRateLimit, authLoginRateLimit } = require("../middleware/rateLimitMiddleware");
const { validateSignup, validateLogin, validateGoogleLogin, validateProfileUpdate } = require("../validators");

router.get("/profile", protect, getProfile);
router.post("/signup", authSignupRateLimit, validateRequest(validateSignup), signup);
router.post("/login", authLoginRateLimit, validateRequest(validateLogin), login);
router.post("/google", authLoginRateLimit, validateRequest(validateGoogleLogin), googleLogin);
router.put("/update-profile", protect, validateRequest(validateProfileUpdate), updateProfile);
module.exports = router;
