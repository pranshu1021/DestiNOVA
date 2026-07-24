const express = require("express");

const router = express.Router();

const { signup,googleLogin, login, getProfile} = require("../controllers/authControllers");

const protect = require("../middleware/authMiddleware");
router.get("/profile",protect,getProfile);
router.post("/signup",signup);
router.post("/login",login);
router.post("/google", googleLogin);
module.exports = router;