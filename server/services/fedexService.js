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
        insertTrackingData(trackingData, (err) => (err ? reject(err) : resolve()));
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
        trackingInfo: [{ trackingNumberInfo: { trackingNumber }, includeDetailedScans: true }],
        includeDetailedScans: true,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-locale': 'en_US',
        },
      }
    );

    const trackResult = response.data.output.completeTrackResults[0].trackResults[0];
    const latestStatus = trackResult.latestStatusDetail || {};
    const dateAndTimes = trackResult.dateAndTimes || [];
    const deliveryDetails = trackResult.deliveryDetails || {};
    const packageDetails = trackResult.packageDetails || {};
    const serviceDetail = trackResult.serviceDetail || {};

    const status = latestStatus.statusByLocale?.toLowerCase() || '';
    const actualDeliveryDate = status.includes('delivered')
      ? dateAndTimes.find(d => d.type === 'ACTUAL_DELIVERY')?.dateTime || null
      : null;
    const estimatedDeliveryDate = !status.includes('delivered') && !status.includes('out for delivery')
      ? dateAndTimes.find(d => d.type === 'ESTIMATED_DELIVERY')?.dateTime || null
      : null;
    const outForDeliveryDate = status.includes('out for delivery')
      ? trackResult.scanEvents?.find(e => e.eventDescription === 'On FedEx vehicle for delivery')?.date || null
      : null;

    const trackingData = {
      trackingNumber,
      statusByLocale: latestStatus.statusByLocale || 'Unknown',
      description: latestStatus.description || 'No description available',
      actualDeliveryDate,
      estimatedDeliveryDate,
      outForDeliveryDate,
      deliveryAttempts: deliveryDetails.deliveryAttempts || '0',
      receivedByName: deliveryDetails.receivedByName || null,
      serviceType: serviceDetail.description || 'FedEx',
      weight: packageDetails.weightAndDimensions?.weight?.[0]?.value
        ? `${packageDetails.weightAndDimensions.weight[0].value} ${packageDetails.weightAndDimensions.weight[0].units}`
        : 'Unknown',
      shipperCity: trackResult.shipperInformation?.address?.city || 'Unknown',
      recipientCity: trackResult.recipientInformation?.address?.city || 'Unknown',
      user_id: userId,
    };

    await insertWithRetry(trackingData);
    return trackingData;
  } catch (error) {
    console.error(`FedEx error for ${trackingNumber}:`, error.message);
    const errorData = {
      trackingNumber,
      statusByLocale: 'Error',
      description: error.response?.data?.errors?.[0]?.message || error.message,
      actualDeliveryDate: null,
      estimatedDeliveryDate: null,
      outForDeliveryDate: null,
      deliveryAttempts: '0',
      receivedByName: null,
      serviceType: 'FedEx',
      weight: 'Unknown',
      shipperCity: 'Unknown',
      recipientCity: 'Unknown',
      user_id: userId,
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
      await new Promise((resolve, reject) => deleteUserTrackingData(userId, (err) => (err ? reject(err) : resolve())));
      for (const trackingNumber of trackingNumbers) {
        const result = await processTrackingNumber(trackingNumber, accessToken, userId);
        trackingDetails.push(result);
        current++;
        callback(null, { total, current, trackingDetails, status: current < total ? 'progress' : 'complete' });
      }
    } catch (error) {
      callback(error, { total, current, trackingDetails, status: 'error', error: error.message });
    }
  })();
}

module.exports = { fetchTrackingDetails };