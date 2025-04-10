const db = require('../db').promise(); // Make sure this imports mysql2/promise

const locationlog = async (req, res) => {
  try {
    const { ip, city, region, country, timezone, timestamp } = req.body;
    const userId = req.user?.id; // Using optional chaining in case user isn't defined
    
    // Validate required fields
    if (!ip || !timestamp || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Use the IP from our middleware if none provided in body
    const clientIp = req.body.ip || req.clientIp;

    // Insert into database
    const query = `
      INSERT INTO location_logs (user_id, ip, city, region, country, timezone, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      userId,
      clientIp,
      city || null,
      region || null,
      country || null,
      timezone || null,
      timestamp
    ];

    // Make sure your db connection is using promises
    const [result] = await db.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Location logged successfully'
    });
  } catch (error) {
    console.error('Location log error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log location',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = locationlog;