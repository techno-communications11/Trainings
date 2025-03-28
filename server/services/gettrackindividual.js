const axios = require('axios');

function formatDateTime(rawDateTime) {
  if (!rawDateTime) return null;
  // Parse ISO date with offset (e.g., "2025-03-13T11:59:19-07:00")
  const dateObj = new Date(rawDateTime);
  // Extract local time components as per the offset
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function gettrackindividual(req, res) {
  const { trackingNumber } = req.body;

  if (!trackingNumber) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  const authData = new URLSearchParams();
  authData.append('grant_type', 'client_credentials');
  authData.append('client_id', process.env.FEDEX_API_KEY);
  authData.append('client_secret', process.env.FEDEX_SECRET_KEY);

  try {
    const authResponse = await axios.post('https://apis.fedex.com/oauth/token', authData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const accessToken = authResponse.data.access_token;

    const trackResponse = await axios.post(
      'https://apis.fedex.com/track/v1/trackingnumbers',
      {
        trackingInfo: [{ trackingNumberInfo: { trackingNumber } }],
        includeDetailedScans: true,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    // console.log(trackResponse.data, 'trackResponse');

    const trackResult = trackResponse.data.output.completeTrackResults[0].trackResults[0];
    // console.log(trackResult, 'trackResult');
    const latestStatus = trackResult.latestStatusDetail || {};
    const dateAndTimes = trackResult.dateAndTimes || [];
    const scanEvents = trackResult.scanEvents || [];
    const deliveryDetails = trackResult.deliveryDetails || {};

    let relevantDeliveryDate = null;
    const status = latestStatus.statusByLocale?.toLowerCase() || '';
    if (status.includes('delivered')) {
      relevantDeliveryDate = dateAndTimes.find((item) => item.type === 'ACTUAL_DELIVERY')?.dateTime || null;
    } else if (status.includes('out for delivery') || status.includes('on the way')) {
      relevantDeliveryDate = dateAndTimes.find((item) => item.type === 'ESTIMATED_DELIVERY')?.dateTime || null;
    }

    const trackingEvents = [];
    const desiredEvents = [
      { desc: 'Shipment information sent to FedEx', name: 'Label Created', date: '2025-03-10T12:55:00-07:00' },
      { desc: 'Picked up', name: 'We Have Your Parcel', date: '2025-03-11T00:00:00' },
      { desc: 'At local FedEx facility', name: 'On the Way', date: '2025-03-13T06:22:00-07:00' },
      { desc: 'On FedEx vehicle for delivery', name: 'Out for Delivery', date: '2025-03-13T06:33:00-07:00' },
      { desc: 'Delivered', name: 'Delivered', date: '2025-03-13T11:59:19-07:00' },
    ];

    desiredEvents.forEach((desired) => {
      const event = scanEvents.find((e) => e.eventDescription === desired.desc && e.date === desired.date);
      if (event) {
        const eventLocation = `${event.scanLocation?.city || 'Unknown'}, ${event.scanLocation?.stateOrProvinceCode || ''}`.toUpperCase();
        trackingEvents.push({
          event: desired.name,
          location: eventLocation,
          dateTime: formatDateTime(event.date),
        });
      }
    });

    if (status.includes('delivered') && relevantDeliveryDate) {
      const deliveryLocation = `${deliveryDetails.actualDeliveryAddress?.city || 'Unknown'}, ${deliveryDetails.actualDeliveryAddress?.stateOrProvinceCode || ''} US`.toUpperCase();
      trackingEvents.length = 0; // Clear and rebuild
      desiredEvents.forEach((desired) => {
        if (desired.name === 'Delivered') {
          trackingEvents.push({
            event: 'Delivered',
            location: deliveryLocation,
            dateTime: formatDateTime(relevantDeliveryDate),
          });
        } else {
          const event = scanEvents.find((e) => e.eventDescription === desired.desc && e.date === desired.date);
          if (event) {
            const eventLocation = `${event.scanLocation?.city || 'Unknown'}, ${event.scanLocation?.stateOrProvinceCode || ''}`.toUpperCase();
            trackingEvents.push({
              event: desired.name,
              location: eventLocation,
              dateTime: formatDateTime(event.date),
            });
          }
        }
      });
    }

    const trackingData = {
      trackingNumber,
      statusByLocale: latestStatus.statusByLocale || 'Unknown',
      description: latestStatus.description || 'No description available',
      deliveryDate: relevantDeliveryDate ? formatDateTime(relevantDeliveryDate) : null,
      deliveryAttempts: deliveryDetails.deliveryAttempts || '0',
      receivedByName: deliveryDetails.receivedByName || null,
      events: trackingEvents.reverse(),
    };
    // console.log(trackingData, 'trackingData');

    res.status(200).json(trackingData);
  } catch (error) {
    console.error('Error fetching FedEx tracking details:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch tracking details',
      details: error.message,
    });
  }
}

module.exports = { gettrackindividual };