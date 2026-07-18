const express = require("express");

const router = express.Router();

const { signup,login, getProfile} = require("../controllers/authControllers");

const protect = require("../middleware/authMiddleware");
router.get("/profile",protect,getProfile);
router.post("/signup",signup);
router.post("/login",login);
module.exports = router;