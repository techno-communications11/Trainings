const db = require('../db');

function deleteUserTrackingData(userId, callback) {
  const query = `DELETE FROM TrackingData WHERE user_id = ?`;
  db.execute(query, [userId], (error) => {
    if (error) {
      console.error('Error deleting user data:', error.message);
      return callback(error);
    }
    console.log(`Previous data deleted for user_id: ${userId}`);
    callback(null);
  });
}

function insertTrackingData(data, callback) {
  const query = `
    INSERT INTO TrackingData 
    (trackingNumber, statusByLocale, description, actualDeliveryDate, estimatedDeliveryDate, outForDeliveryDate, 
     deliveryAttempts, receivedByName, serviceType, weight, shipperCity, recipientCity, user_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.trackingNumber || null,
    data.statusByLocale || null,
    data.description || null,
    data.actualDeliveryDate || null,
    data.estimatedDeliveryDate || null,
    data.outForDeliveryDate || null,
    data.deliveryAttempts || null,
    data.receivedByName || null,
    data.serviceType || null,
    data.weight || null,
    data.shipperCity || null,
    data.recipientCity || null,
    data.user_id || null,
  ];

  db.execute(query, values, (error, results) => {
    if (error) {
      console.error(`Error inserting data for ${data.trackingNumber}:`, error.message);
      return callback(error);
    }
    console.log(`Data inserted for tracking number: ${data.trackingNumber}`);
    callback(null, results);
  });
}

module.exports = { deleteUserTrackingData, insertTrackingData };