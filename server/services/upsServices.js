const axios = require("axios");
const { deleteUserTrackingData, insertTrackingData } = require("./databaseService");
require("dotenv").config();

function getAccessToken(callback) {
  console.log('Attempting to get UPS access token');
  const credentials = `${process.env.UPS_API_KEY}:${process.env.UPS_SECRET_KEY}`;
  const encodedCredentials = Buffer.from(credentials).toString("base64");

  const authData = new URLSearchParams();
  authData.append("grant_type", "client_credentials");

  axios.post(
    "https://onlinetools.ups.com/security/v1/oauth/token",
    authData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${encodedCredentials}`,
      },
    }
  )
  .then(response => {
    console.log('UPS access token received');
    callback(null, response.data.access_token);
  })
  .catch(error => {
    console.error("Error fetching UPS access token:", error.response?.data || error.message);
    callback(error);
  });
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
      console.log(`Successfully inserted data for ${trackingData.trackingNumber}`);
      return true;
    } catch (error) {
      console.error(`Attempt ${i + 1}/${retries} failed for ${trackingData.trackingNumber}:`, error.message);
      if (i === retries - 1) {
        console.error(`All retries failed for ${trackingData.trackingNumber}`);
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function processTrackingNumber(trackingNumber, accessToken, userId) {
  console.log(`Processing tracking number: ${trackingNumber}`);
  
  try {
    const response = await axios.get(
      `https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "transId": `${Date.now()}`,
          "transactionSrc": "tracking_app",
          "Content-Type": "application/json",
        },
      }
    );

    const shipment = response.data?.trackResponse?.shipment?.[0];
    if (!shipment) throw new Error("No shipment data found");

    const packageDetails = shipment.package?.[0] || {};
    const latestStatus = packageDetails.currentStatus || {};
    const activities = packageDetails.activity || [];
    const deliveryInfo = packageDetails.deliveryInformation || {};

    const relevantActivity = activities.find(activity => 
      activity.status?.code === latestStatus.code
    ) || activities[0] || {};

    let formattedDeliveryDate = null;
    if (relevantActivity.date && relevantActivity.time) {
      const upsDate = relevantActivity.date;
      const upsTime = relevantActivity.time.padEnd(6, '0');
      const utcDate = new Date(
        `${upsDate.substring(0, 4)}-${upsDate.substring(4, 6)}-${upsDate.substring(6, 8)}T${upsTime.substring(0, 2)}:${upsTime.substring(2, 4)}:${upsTime.substring(4, 6)}Z`
      );
      const adjustedDate = new Date(utcDate.getTime() - (7 * 60 * 60 * 1000));
      const isoString = adjustedDate.toISOString().replace('Z', '');
      formattedDeliveryDate = `${isoString}-07:00`;
    }

    const trackingData = {
      trackingNumber: trackingNumber,
      statusByLocale: latestStatus.description || "Unknown",
      description: latestStatus.description || "No description available",
      deliveryAttempts: packageDetails.deliveryAttempts || 0,
      receivedByName: deliveryInfo.receivedBy || null,
      deliveryDate: formattedDeliveryDate,
      upsOriginalTime: relevantActivity.date && relevantActivity.time 
        ? `${relevantActivity.date} ${relevantActivity.time}` 
        : null,
      user_id: userId
    };

    const success = await insertWithRetry(trackingData);
    return success ? trackingData : null;
  } catch (error) {
    console.error(`Error fetching UPS tracking for ${trackingNumber}:`, error.response?.data || error.message);
    const errorData = {
      trackingNumber: trackingNumber,
      statusByLocale: "Error",
      description: error.response?.data?.message || error.message,
      deliveryAttempts: 0,
      receivedByName: null,
      deliveryDate: null,
      upsOriginalTime: null,
      user_id: userId
    };
    const success = await insertWithRetry(errorData);
    return success ? errorData : null;
  }
}

function getUpsTrackingDetails(trackingNumbers, userId, callback) {
  console.log('Starting getUpsTrackingDetails with:', { trackingNumbers, userId });
  
  if (!Array.isArray(trackingNumbers) || trackingNumbers.length === 0) {
    console.error('Invalid tracking numbers array');
    return callback(new Error("Please provide a non-empty array of tracking numbers"));
  }

  const trackingDetails = [];
  const total = trackingNumbers.length;
  let current = 0;

  getAccessToken(async (error, accessToken) => {
    if (error) {
      console.error('Access token error:', error);
      return callback(error);
    }
    console.log('Using access token:', accessToken);

    try {
      await new Promise((resolve, reject) => {
        deleteUserTrackingData(userId, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('Previous user data deleted successfully');

      for (const trackingNumber of trackingNumbers) {
        if (!trackingNumber || typeof trackingNumber !== 'string' || trackingNumber.trim() === '') {
          console.error('Skipping invalid tracking number:', trackingNumber);
          current++;
          callback(null, { total, current, trackingDetails, status: 'progress' });
          continue;
        }

        const result = await processTrackingNumber(trackingNumber, accessToken, userId);
        current++;
        
        if (result) {
          trackingDetails.push(result);
        } else {
          console.error(`Failed to process ${trackingNumber} after retries`);
        }

        // Send progress update to callback
        console.log(`Progress: ${current}/${total} tracking numbers processed`);
        callback(null, { 
          total, 
          current, 
          trackingDetails: [...trackingDetails], 
          status: current < total ? 'progress' : 'complete' 
        });
      }

    } catch (err) {
      console.error('Error in processing:', err);
      callback(err, { total, current, trackingDetails, status: 'error' });
    }
  });
}

module.exports = { getUpsTrackingDetails };