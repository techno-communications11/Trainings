const axios = require("axios");
const { deleteUserTrackingData, insertTrackingData } = require("./databaseService");
require("dotenv").config();

function getAccessToken(callback) {
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
    .then(response => callback(null, response.data.access_token))
    .catch(error => {
        console.error("Error fetching UPS access token:", error.response?.data || error.message);
        callback(error);
    });
}

function getUpsTrackingDetails(trackingNumbers, userId, callback) {
    if (!Array.isArray(trackingNumbers) || trackingNumbers.length === 0) {
        return callback ? callback(new Error("Please provide an array of tracking numbers")) : null;
    }

    const trackingDetails = [];
    let completed = 0;
    const total = trackingNumbers.length;

    function checkComplete(err) {
        if (err) {
            console.error("Error in processing:", err);
        }
        completed++;
        if (completed === total && callback) {
            callback(null, trackingDetails);
        }
    }

    getAccessToken((error, accessToken) => {
        if (error) return callback ? callback(error) : null;

        deleteUserTrackingData(userId, (truncateError) => {
            if (truncateError) return callback ? callback(truncateError) : null;

            trackingNumbers.forEach(trackingNumber => {
                if (!trackingNumber || typeof trackingNumber !== 'string' || trackingNumber.trim() === '') {
                    console.error('Skipping invalid or empty tracking number:', trackingNumber);
                    checkComplete(new Error('Invalid tracking number'));
                    return;
                }

                axios.get(
                    `https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${accessToken}`,
                            "transId": `${Date.now()}`,
                            "transactionSrc": "tracking_app",
                            "Content-Type": "application/json",
                        },
                    }
                )
                .then(response => {
                    const shipment = response.data?.trackResponse?.shipment?.[0];
                    if (!shipment) throw new Error("No shipment data found");

                    const packageDetails = shipment.package?.[0] || {};
                    const latestStatus = packageDetails.currentStatus || {};
                    const activities = packageDetails.activity || [];
                    const deliveryInfo = packageDetails.deliveryInformation || {};

                    // Find the most relevant activity for the current status
                    const relevantActivity = activities.find(activity => 
                        activity.status?.code === latestStatus.code
                    ) || activities[0] || {};

                    // Format date with -7 hour time adjustment
                    let formattedDeliveryDate = null;
                    if (relevantActivity.date && relevantActivity.time) {
                        // Parse UPS date (YYYYMMDD) and time (HHMMSS)
                        const upsDate = relevantActivity.date;
                        const upsTime = relevantActivity.time.padEnd(6, '0');
                        
                        // Create date object in UTC
                        const utcDate = new Date(
                            `${upsDate.substring(0, 4)}-${upsDate.substring(4, 6)}-${upsDate.substring(6, 8)}T${upsTime.substring(0, 2)}:${upsTime.substring(2, 4)}:${upsTime.substring(4, 6)}Z`
                        );

                        // Apply -7 hour offset
                        const adjustedDate = new Date(utcDate.getTime() - (7 * 60 * 60 * 1000));
                        
                        // Format as ISO 8601 with -07:00 timezone
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
                        user_id: userId // Add user_id to the tracking data
                    };

                    insertTrackingData(trackingData, (insertError) => {
                        if (insertError) {
                            console.error(`Error inserting data for ${trackingNumber}:`, insertError);
                            checkComplete(insertError);
                            return;
                        }
                        trackingDetails.push(trackingData);
                        checkComplete(null);
                    });
                })
                .catch(error => {
                    console.error(`Error for ${trackingNumber}:`, error.response?.data || error.message);
                    const errorData = {
                        trackingNumber: trackingNumber,
                        statusByLocale: "Error",
                        description: error.message,
                        deliveryAttempts: 0,
                        receivedByName: null,
                        deliveryDate: null,
                        upsOriginalTime: null,
                        user_id: userId // Add user_id to the error data as well
                    };
                    insertTrackingData(errorData, (insertError) => {
                        if (insertError) {
                            console.error(`Error inserting error data for ${trackingNumber}:`, insertError);
                            checkComplete(insertError);
                            return;
                        }
                        trackingDetails.push(errorData);
                        checkComplete(null);
                    });
                });
            });
        });
    });
}

module.exports = { getUpsTrackingDetails };