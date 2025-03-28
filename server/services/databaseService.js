// databaseService.js
const db = require('../db');

function truncateTrackingData(callback) {
    const query = `TRUNCATE TABLE TrackingData`;
    
    db.execute(query, (error, results) => {
        if (error) {
            console.error('Error truncating the table:', error.message);
            return callback ? callback(error) : null;
        }
        // console.log('TrackingData table truncated.');
        callback ? callback(null) : null;
    });
}

function insertTrackingData(data, callback) {
  const query = `
      INSERT INTO TrackingData 
      (trackingNumber, statusByLocale, description, deliveryDate, deliveryAttempts, receivedByName) 
      VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Replace undefined values with null
  const values = [
      data.trackingNumber || null,
      data.statusByLocale || null,
      data.description || null,
      data.deliveryDate || null,
      data.deliveryAttempts || null,
      data.receivedByName || null
  ];

  db.execute(query, values, (error, results) => {
      if (error) {
          console.error(`Error inserting data for tracking number ${data.trackingNumber}:`, error.message);
          return callback ? callback(error) : null;
      }
      console.log(`Data inserted for tracking number: ${data.trackingNumber}`);
      callback ? callback(null, results) : null;
  });
}

// Export the functions
module.exports = { truncateTrackingData, insertTrackingData };