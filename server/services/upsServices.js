const axios = require('axios');
const { deleteUserTrackingData, insertTrackingData } = require('./databaseService');
require('dotenv').config();

function getAccessToken(callback) {
  const credentials = `${process.env.UPS_API_KEY}:${process.env.UPS_SECRET_KEY}`;
  const encodedCredentials = Buffer.from(credentials).toString('base64');
  const authData = new URLSearchParams();
  authData.append('grant_type', 'client_credentials');

  axios.post(
    'https://onlinetools.ups.com/security/v1/oauth/token',
    authData,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${encodedCredentials}` } }
  )
    .then(response => callback(null, response.data.access_token))
    .catch(error => callback(error));
}

async function insertWithRetry(trackingData, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((resolve, reject) => insertTrackingData(trackingData, (err) => (err ? reject(err) : resolve())));
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function processTrackingNumber(trackingNumber, accessToken, userId) {
  try {
    const response = await axios.get(
      `https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          transId: `${Date.now()}`,
          transactionSrc: 'tracking_app',
          'Content-Type': 'application/json',
        },
      }
    );

    const shipment = response.data?.trackResponse?.shipment?.[0];
    if (!shipment) throw new Error('No shipment data found');
    const packageDetails = shipment.package?.[0] || {};
    const latestStatus = packageDetails.currentStatus || {};
    const activities = packageDetails.activity || [];
    const deliveryInfo = packageDetails.deliveryInformation || {};

    const status = latestStatus.description?.toLowerCase() || '';
    let actualDeliveryDate = null;
    let estimatedDeliveryDate = null;
    let outForDeliveryDate = null;

    // Extract dates from activities first for accuracy
    const deliveredActivity = activities.find(a => a.status?.description?.toLowerCase().includes('delivered'));
    const outForDeliveryActivity = activities.find(a => a.status?.description?.toLowerCase().includes('out for delivery'));
    const estimatedActivity = activities.find(a => a.status?.description?.toLowerCase().includes('estimated delivery') || a.status?.type === 'D'); // 'D' for delivery estimate

    if (deliveredActivity?.date && deliveredActivity?.time) {
      const dateStr = deliveredActivity.date;
      const timeStr = deliveredActivity.time.padEnd(6, '0'); // Ensure 6 digits (HHMMSS)
      actualDeliveryDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}-05:00`;
    } else if (status.includes('delivered') && packageDetails.deliveryDate?.[0]?.date && packageDetails.deliveryTime?.endTime) {
      actualDeliveryDate = `${packageDetails.deliveryDate[0].date.slice(0, 4)}-${packageDetails.deliveryDate[0].date.slice(4, 6)}-${packageDetails.deliveryDate[0].date.slice(6, 8)}T${packageDetails.deliveryTime.endTime.slice(0, 2)}:${packageDetails.deliveryTime.endTime.slice(2, 4)}:${packageDetails.deliveryTime.endTime.slice(4, 6)}-05:00`;
    }

    if (outForDeliveryActivity?.date && outForDeliveryActivity?.time) {
      const dateStr = outForDeliveryActivity.date;
      const timeStr = outForDeliveryActivity.time.padEnd(6, '0'); // Ensure 6 digits (HHMMSS)
      outForDeliveryDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}-05:00`;
    }

    if (estimatedActivity?.date && estimatedActivity?.time) {
      const dateStr = estimatedActivity.date;
      const timeStr = estimatedActivity.time.padEnd(6, '0') || '000000'; // Default to midnight if no time
      estimatedDeliveryDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}-05:00`;
    } else if (!status.includes('delivered') && !status.includes('out for delivery') && packageDetails.deliveryDate?.[0]?.date) {
      estimatedDeliveryDate = `${packageDetails.deliveryDate[0].date.slice(0, 4)}-${packageDetails.deliveryDate[0].date.slice(4, 6)}-${packageDetails.deliveryDate[0].date.slice(6, 8)}T00:00:00-05:00`;
    }

    const trackingData = {
      trackingNumber,
      statusByLocale: latestStatus.description || 'Unknown',
      description: latestStatus.description || 'No description available',
      actualDeliveryDate,
      estimatedDeliveryDate,
      outForDeliveryDate,
      deliveryAttempts: deliveryInfo.attempts || '0',
      receivedByName: deliveryInfo.receivedBy || null,
      serviceType: shipment.service?.description || 'UPS',
      weight: packageDetails.weight?.displayWeight || 'Unknown',
      shipperCity: shipment.shipperAddress?.city || 'Unknown',
      recipientCity: packageDetails.packageAddress?.find(addr => addr.type === 'DESTINATION')?.address?.city || 'Unknown',
      user_id: userId,
    };

    await insertWithRetry(trackingData);
    console.log(`Raw API Response for ${trackingNumber}:`, response.data); // Debug raw response
    console.log(`Processed UPS tracking ${trackingNumber}:`, trackingData); // Debug processed data
    return trackingData;
  } catch (error) {
    console.error(`UPS error for ${trackingNumber}:`, error.response?.data || error.message);
    const errorData = {
      trackingNumber,
      statusByLocale: 'Error',
      description: error.response?.data?.message || error.message,
      actualDeliveryDate: null,
      estimatedDeliveryDate: null,
      outForDeliveryDate: null,
      deliveryAttempts: '0',
      receivedByName: null,
      serviceType: 'UPS',
      weight: 'Unknown',
      shipperCity: 'Unknown',
      recipientCity: 'Unknown',
      user_id: userId,
    };
    await insertWithRetry(errorData);
    console.log(`Error data for ${trackingNumber}:`, errorData); // Debug error data
    return errorData;
  }
}

function getUpsTrackingDetails(trackingNumbers, userId, callback) {
  const trackingDetails = [];
  const total = trackingNumbers.length;
  let current = 0;

  getAccessToken(async (error, accessToken) => {
    if (error) return callback(error);
    try {
      await new Promise((resolve, reject) => deleteUserTrackingData(userId, (err) => (err ? reject(err) : resolve())));
      for (const trackingNumber of trackingNumbers) {
        const result = await processTrackingNumber(trackingNumber, accessToken, userId);
        trackingDetails.push(result);
        current++;
        callback(null, { total, current, trackingDetails, status: current < total ? 'progress' : 'complete' });
      }
    } catch (err) {
      callback(err, { total, current, trackingDetails, status: 'error' });
    }
  });
}

module.exports = { getUpsTrackingDetails };