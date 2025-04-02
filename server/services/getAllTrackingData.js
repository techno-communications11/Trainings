const db = require('../db');

async function getAllTrackingData(req, res) {
  const userId = req.user ? req.user.id : 1; // Replace with your auth logic
  const query = 'SELECT DISTINCT * FROM TrackingData WHERE user_id = ?';

  try {
    const [rows] = await db.promise().execute(query, [userId]);
    console.log(`Fetched data for user_id ${userId} from TrackingData:`, rows);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching data from TrackingData:', error.message);
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
}

module.exports = { getAllTrackingData };