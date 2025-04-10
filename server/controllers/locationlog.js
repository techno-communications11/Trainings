// controllers/locationlog.js
const db = require('../db');

const locationlog = (req, res) => {
  const { city, region, country, timezone, timestamp } = req.body;
  const userId = req.user.id; // Assuming authenticateToken middleware adds user to req
  
  // Use the IPv4 address from middleware, explicitly ignoring req.body.ip
  const clientIp = req.clientIp;

  // Validate required fields
  if (!clientIp || !timestamp || !userId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  // Insert into database using callback
  const query = `
    INSERT INTO location_logs (user_id, ip, city, region, country, timezone, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    userId,
    clientIp, // Always IPv4 from middleware
    city || null,
    region || null,
    country || null,
    timezone || null,
    timestamp
  ];

  db.execute(query, values, (error, results) => {
    if (error) {
      console.error('Location log error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to log location',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location logged successfully'
    });
  });
};

module.exports = locationlog;