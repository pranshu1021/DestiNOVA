const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("isAdmin").lean();
    if (!user?.isAdmin) return res.status(403).json({ success: false, message: "Admin access is required." });
    return next();
  } catch (error) { return next(error); }
};
