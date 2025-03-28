const axios = require("axios");
const {
  truncateTrackingData,
  insertTrackingData,
} = require("./databaseService");
require("dotenv").config();

async function getAccessToken() {
  const authData = new URLSearchParams();
  authData.append("grant_type", "client_credentials");
  authData.append("client_id", process.env.FEDEX_API_KEY);
  authData.append("client_secret", process.env.FEDEX_SECRET_KEY);

  const response = await axios.post(
    "https://apis.fedex.com/oauth/token",
    authData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}

async function fetchTrackingDetails(trackingNumbers) {
  const trackingDetails = [];
  const accessToken = await getAccessToken();

  // Truncate the table before inserting new data
  await truncateTrackingData();

  for (const trackingNumber of trackingNumbers) {
      try {
          const response = await axios.post(
              "https://apis.fedex.com/track/v1/trackingnumbers",
              {
                  trackingInfo: [
                      {
                          trackingNumberInfo: { trackingNumber },
                      },
                  ],
              },
              {
                  headers: {
                      Authorization: `Bearer ${accessToken}`,
                      "Content-Type": "application/json",
                  },
              }
          );

          const trackResult =
              response.data.output.completeTrackResults[0].trackResults[0];
        //   console.log(trackResult, "trsscsdjdgjd");
          const latestStatus = trackResult.latestStatusDetail;
          const dateAndTimes = trackResult.dateAndTimes || [];

          let relevantDeliveryDate = null;
          const status = latestStatus.statusByLocale.toLowerCase();

          if (status.includes("delivered")) {
              relevantDeliveryDate =
                  dateAndTimes.find((item) => item.type === "ACTUAL_DELIVERY")
                      ?.dateTime || null;
          } else if (status.includes("out for delivery")) {
              relevantDeliveryDate =
                  dateAndTimes.find((item) => item.type === "ESTIMATED_DELIVERY")
                      ?.dateTime || null;
          } else if (status.includes("on the way")) {
              relevantDeliveryDate =
                  dateAndTimes.find((item) => item.type === "ESTIMATED_DELIVERY")
                      ?.dateTime || null;
          }

          const deliveryDetails = trackResult.deliveryDetails || {};
          const trackingData = {
              trackingNumber,
              statusByLocale: latestStatus.statusByLocale,
              description: latestStatus.description,
              deliveryDate: relevantDeliveryDate,
              deliveryAttempts: deliveryDetails.deliveryAttempts || 0,
              receivedByName: deliveryDetails.receivedByName || null,
          };

          // Insert into database
          await insertTrackingData(trackingData);
          trackingDetails.push(trackingData);
      } catch (error) {
          console.error(
              `Error fetching tracking for ${trackingNumber}:`,
              error.message
          );
          trackingDetails.push({
              trackingNumber,
              statusByLocale: "Error",
              description: "Failed to fetch tracking details",
              deliveryDate: null,
              deliveryAttempts: 0,
              receivedByName: null,
          });
      }
  }

  return trackingDetails;
}

module.exports = { fetchTrackingDetails };
