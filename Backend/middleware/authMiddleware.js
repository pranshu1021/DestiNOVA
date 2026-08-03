const jwt = require("jsonwebtoken");
const config = require("../config");

const protect = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication is required." });
  }

  const token = authorization.slice(7).trim();
  if (!token || token.split(".").length !== 3) {
    return res.status(401).json({ success: false, message: "Authentication token is invalid." });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    if (!decoded?.id) throw new Error("Missing token subject");
    req.user = { id: decoded.id };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Authentication token is invalid or expired." });
  }
};

module.exports = protect;
