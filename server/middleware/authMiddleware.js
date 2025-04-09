const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  try {
    if (!req.cookies) {
      return res.status(500).json({ 
        success: false,
        error: "Cookie parser not configured correctly" 
      });
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: "Authentication token required" 
      });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: "Token expired" 
      });
    }
    return res.status(403).json({ 
      success: false,
      error: "Invalid token" 
    });
  }
};

module.exports = authenticateToken;