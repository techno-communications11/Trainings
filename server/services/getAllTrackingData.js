const db = require('../db');

async function getAllTrackingData(req, res) {
  const query = 'SELECT DISTINCT * FROM TrackingData';

  try {
    // Using db.promise() to enable async/await support
    const [rows] = await db.promise().execute(query);

    console.log('Fetched all data from TrackingData:', rows);

    // Send the fetched data as a JSON response
    res.status(200).json(rows);  // This sends the data as a response
  } catch (error) {
    console.error('Error fetching data from TrackingData:', error.message);
    
    // Send an error response in case of failure
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
}

module.exports = { getAllTrackingData };
