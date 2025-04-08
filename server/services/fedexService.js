const axios = require('axios');
const { deleteUserTrackingData, insertTrackingData } = require('./databaseService');
require('dotenv').config();

async function getAccessToken() {
  const authData = new URLSearchParams();
  authData.append('grant_type', 'client_credentials');
  authData.append('client_id', process.env.FEDEX_API_KEY);
  authData.append('client_secret', process.env.FEDEX_SECRET_KEY);

  try {
    const response = await axios.post(
      'https://apis.fedex.com/oauth/token',
      authData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('FedEx auth error:', error.response?.data || error.message);
    throw error;
  }
}

async function insertWithRetry(trackingData, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((resolve, reject) => {
        insertTrackingData(trackingData, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function processTrackingNumber(trackingNumber, accessToken, userId) {
  try {
    const response = await axios.post(
      'https://apis.fedex.com/track/v1/trackingnumbers',
      {
        trackingInfo: [{
          trackingNumberInfo: { trackingNumber },
          includeDetailedScans: true
        }]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-locale': 'en_US'
        }
      }
    );

    const trackResult = response.data.output.completeTrackResults[0].trackResults[0];
    const latestStatus = trackResult.latestStatusDetail;
    const dateAndTimes = trackResult.dateAndTimes || [];
    const deliveryDetails = trackResult.deliveryDetails || {};

    // Process delivery date
    let deliveryDate = null;
    const status = latestStatus.statusByLocale.toLowerCase();
    
    if (status.includes('delivered')) {
      deliveryDate = dateAndTimes.find(d => d.type === 'ACTUAL_DELIVERY')?.dateTime;
    } else if (status.includes('out for delivery')) {
      deliveryDate = dateAndTimes.find(d => d.type === 'ESTIMATED_DELIVERY')?.dateTime;
    }

    if (deliveryDate) {
      const dateObj = new Date(deliveryDate);
      dateObj.setHours(dateObj.getHours() - 7); // Adjust for timezone if needed
      deliveryDate = dateObj.toISOString();
    }

    const trackingData = {
      trackingNumber,
      statusByLocale: latestStatus.statusByLocale,
      description: latestStatus.description || latestStatus.status,
      deliveryDate,
      deliveryAttempts: deliveryDetails.deliveryAttempts || 0,
      receivedByName: deliveryDetails.receivedByName || null,
      user_id: userId
    };

    await insertWithRetry(trackingData);
    return trackingData;
  } catch (error) {
    console.error(`FedEx tracking error for ${trackingNumber}:`, error.message);
    const errorData = {
      trackingNumber,
      statusByLocale: 'Error',
      description: error.response?.data?.errors?.[0]?.message || error.message,
      deliveryDate: null,
      deliveryAttempts: 0,
      receivedByName: null,
      user_id: userId
    };
    await insertWithRetry(errorData);
    return errorData;
  }
}

function fetchTrackingDetails(trackingNumbers, userId, callback) {
  const total = trackingNumbers.length;
  let current = 0;
  const trackingDetails = [];

  (async () => {
    try {
      const accessToken = await getAccessToken();
      
      // Clear previous data
      await new Promise((resolve, reject) => {
        deleteUserTrackingData(userId, (err) => err ? reject(err) : resolve());
      });

      for (const trackingNumber of trackingNumbers) {
        try {
          const result = await processTrackingNumber(trackingNumber, accessToken, userId);
          trackingDetails.push(result);
        } catch (error) {
          console.error(`Error processing ${trackingNumber}:`, error);
          trackingDetails.push({
            trackingNumber,
            statusByLocale: 'Error',
            description: error.message,
            user_id: userId
          });
        }

        current++;
        
        // Send progress update after each tracking number
        callback(null, {
          total,
          current,
          trackingDetails: [...trackingDetails],
          status: current < total ? 'progress' : 'complete'
        });
      }
    } catch (error) {
      console.error('FedEx processing failed:', error);
      callback(error, {
        total,
        current,
        trackingDetails: [...trackingDetails],
        status: 'error',
        error: error.message
      });
    }
  })();
}

module.exports = { fetchTrackingDetails };