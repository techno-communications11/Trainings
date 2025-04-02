const axios = require('axios');
const { deleteUserTrackingData, insertTrackingData } = require('./databaseService');
require('dotenv').config();

async function getAccessToken() {
  const authData = new URLSearchParams();
  authData.append('grant_type', 'client_credentials');
  authData.append('client_id', process.env.FEDEX_API_KEY);
  authData.append('client_secret', process.env.FEDEX_SECRET_KEY);

  const response = await axios.post(
    'https://apis.fedex.com/oauth/token',
    authData,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return response.data.access_token;
}

async function fetchTrackingDetails(trackingNumbers, userId) {
  const trackingDetails = [];
  const accessToken = await getAccessToken();

  // Delete only this user's previous data
  await new Promise((resolve, reject) => {
    deleteUserTrackingData(userId, (err) => (err ? reject(err) : resolve()));
  });

  for (const trackingNumber of trackingNumbers) {
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
        relevantDeliveryDate =
          dateAndTimes.find((item) => item.type === 'ACTUAL_DELIVERY')?.dateTime || null;
      } else if (status.includes('out for delivery') || status.includes('on the way')) {
        relevantDeliveryDate =
          dateAndTimes.find((item) => item.type === 'ESTIMATED_DELIVERY')?.dateTime || null;
      }

      // Adjust deliveryDate by subtracting 6 hours if it exists
      if (relevantDeliveryDate) {
        const dateObj = new Date(relevantDeliveryDate);
        dateObj.setHours(dateObj.getHours() - 7);
        relevantDeliveryDate = dateObj.toISOString(); // Keep in ISO format (e.g., "2025-01-13T08:30:00Z")
      }

      const deliveryDetails = trackResult.deliveryDetails || {};
      const trackingData = {
        trackingNumber,
        statusByLocale: latestStatus.statusByLocale,
        description: latestStatus.description,
        deliveryDate: relevantDeliveryDate,
        deliveryAttempts: deliveryDetails.deliveryAttempts || 0,
        receivedByName: deliveryDetails.receivedByName || null,
        user_id: userId, // Add user_id to the data
      };

      await new Promise((resolve, reject) => {
        insertTrackingData(trackingData, (err) => (err ? reject(err) : resolve()));
      });
      trackingDetails.push(trackingData);
    } catch (error) {
      console.error(`Error fetching tracking for ${trackingNumber}:`, error.message);
      trackingDetails.push({
        trackingNumber,
        statusByLocale: 'Error',
        description: 'Failed to fetch tracking details',
        deliveryDate: null,
        deliveryAttempts: 0,
        receivedByName: null,
        user_id: userId,
      });
    }
  }

  return trackingDetails;
}

module.exports = { fetchTrackingDetails };