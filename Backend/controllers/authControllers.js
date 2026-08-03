const authService = require("../services/authService");
const logger = require("../utils/logger");

const signup = async (req, res, next) => {
  try {
    await authService.signup(req.body);
    logger.info("auth.signup.success", { ip: req.ip });
    return res.status(201).json({ success: true, message: "Account created successfully." });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    logger.info("auth.login.success", { userId: String(result.user.id), ip: req.ip });
    return res.status(200).json({ success: true, message: "Login Successful.", ...result });
  } catch (error) {
    return next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const result = await authService.googleLogin(req.body.idToken);
    logger.info("auth.google.success", { userId: String(result.user.id), ip: req.ip });
    return res.status(200).json({ success: true, message: "Google Login Successful.", ...result });
  } catch (error) {
    return next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    logger.info("auth.profile.updated", { userId: req.user.id });
    return res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    return next(error);
  }
};

module.exports = { signup, googleLogin, login, getProfile, updateProfile };
