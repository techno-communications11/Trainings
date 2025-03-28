// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  // Check if cookies exist
  if (!req.cookies) {
    return res.status(500).json({ error: "Cookie parser not configured" });
  }

  const token = req.cookies.token;
  console.log("Token:", token); // Debug log

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = authenticateToken;