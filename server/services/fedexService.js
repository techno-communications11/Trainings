const axios = require('axios');
const { deleteUserTrackingData, insertTrackingData } = require('./databaseService');
require('dotenv').config();

async function getAccessToken() {
  const authData = new URLSearchParams();
  authData.append('grant_type', 'client_credentials');
  authData.append('client_id', process.env.FEDEX_API_KEY);
  authData.append('client_secret', process.env.FEDEX_SECRET_KEY);

  console.log('Attempting to get FedEx access token...');
  try {
    const response = await axios.post(
      'https://apis.fedex.com/oauth/token',
      authData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    console.log('Access token received');
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error(`Failed to get FedEx access token: ${error.message}`);
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
      console.log(`Inserted data for ${trackingData.trackingNumber}`);
      return;
    } catch (error) {
      console.error(`Attempt ${i + 1}/${retries} failed for ${trackingData.trackingNumber}:`, error.message);
      if (i === retries - 1) {
        console.error(`All retries failed for ${trackingData.trackingNumber}`);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function processTrackingNumber(trackingNumber, accessToken, userId) {
  console.log(`Processing FedEx tracking number: ${trackingNumber}`);
  try {
    const response = await axios.post(
      'https://apis.fedex.com/track/v1/trackingnumbers',
      { trackingInfo: [{ trackingNumberInfo: { trackingNumber } }] },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const trackResult = response.data.output.completeTrackResults[0].trackResults[0];
    const latestStatus = trackResult.latestStatusDetail;
    const dateAndTimes = trackResult.dateAndTimes || [];

    let relevantDeliveryDate = null;
    const status = latestStatus.statusByLocale.toLowerCase();

    if (status.includes('delivered')) {
      relevantDeliveryDate = dateAndTimes.find((item) => item.type === 'ACTUAL_DELIVERY')?.dateTime || null;
    } else if (status.includes('out for delivery') || status.includes('on the way')) {
      relevantDeliveryDate = dateAndTimes.find((item) => item.type === 'ESTIMATED_DELIVERY')?.dateTime || null;
    }

    if (relevantDeliveryDate) {
      const dateObj = new Date(relevantDeliveryDate);
      dateObj.setHours(dateObj.getHours() - 7);
      relevantDeliveryDate = dateObj.toISOString();
    }

    const deliveryDetails = trackResult.deliveryDetails || {};
    const trackingData = {
      trackingNumber,
      statusByLocale: latestStatus.statusByLocale,
      description: latestStatus.description,
      deliveryDate: relevantDeliveryDate,
      deliveryAttempts: deliveryDetails.deliveryAttempts || 0,
      receivedByName: deliveryDetails.receivedByName || null,
      user_id: userId,
    };

    await insertWithRetry(trackingData);
    return trackingData;
  } catch (error) {
    console.error(`Error fetching tracking for ${trackingNumber}:`, error.message);
    const errorData = {
      trackingNumber,
      statusByLocale: 'Error',
      description: `Failed to fetch tracking details: ${error.message}`,
      deliveryDate: null,
      deliveryAttempts: 0,
      receivedByName: null,
      user_id: userId,
    };
    await insertWithRetry(errorData);
    return errorData;
  }
}

function fetchTrackingDetails(trackingNumbers, userId, callback) {
  console.log('Starting fetchTrackingDetails with:', { trackingNumbers, userId });
  const trackingDetails = [];
  const total = trackingNumbers.length;
  let current = 0;

  if (!Array.isArray(trackingNumbers) || trackingNumbers.length === 0) {
    console.error('Invalid tracking numbers array');
    return callback(new Error('No valid tracking numbers provided'));
  }

  (async () => {
    try {
      const accessToken = await getAccessToken();
      console.log('Using FedEx access token');

      await new Promise((resolve, reject) => {
        deleteUserTrackingData(userId, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('Previous user tracking data deleted');

      for (const trackingNumber of trackingNumbers) {
        const result = await processTrackingNumber(trackingNumber, accessToken, userId);
        current++;
        trackingDetails.push(result);

        console.log(`Progress: ${current}/${total} FedEx tracking numbers processed`);
        callback(null, {
          total,
          current,
          trackingDetails: [...trackingDetails],
          status: current < total ? 'progress' : 'complete',
        });
      }
    } catch (error) {
      console.error('Error in FedEx processing:', error.message);
      callback(error, {
        total,
        current,
        trackingDetails: [...trackingDetails],
        status: 'error',
        error: error.message,
      });
    }
  })();
}

module.exports = { fetchTrackingDetails };