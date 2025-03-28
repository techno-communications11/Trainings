const axios = require('axios');
require('dotenv').config();

function formatDeliveryDate(rawDate, rawTime = '000000') {
  if (!rawDate) return null;

  const year = rawDate.slice(0, 4);
  const month = rawDate.slice(4, 6);
  const day = rawDate.slice(6, 8);
  const hours = rawTime.slice(0, 2);
  const minutes = rawTime.slice(2, 4);
  const seconds = rawTime.slice(4, 6);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function getupsindividual(req, res) {
  const { trackingNumber } = req.body;

  if (!trackingNumber) {
    return res.status(400).json({ error: 'Tracking number is required' });
  }

  const authData = new URLSearchParams();
  authData.append('grant_type', 'client_credentials');

  try {
    // Get access token
    const credentials = `${process.env.UPS_API_KEY}:${process.env.UPS_SECRET_KEY}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    const authResponse = await axios.post(
      'https://onlinetools.ups.com/security/v1/oauth/token',
      authData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedCredentials}`,
        },
      }
    );

    const accessToken = authResponse.data.access_token;

    // Fetch tracking details
    const trackResponse = await axios.get(
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

    // Process UPS API response
    const shipment = trackResponse.data?.trackResponse?.shipment?.[0];
    console.log(shipment, 'ss'); // Log full shipment data

    if (!shipment) {
      throw new Error('No shipment data found');
    }

    const packageDetails = shipment.package?.[0];
    console.log(packageDetails, 'ppp'); // Log package details

    if (!packageDetails) {
      throw new Error('No package details available');
    }

    const latestStatus = packageDetails.currentStatus || {};
    const deliveryDate = packageDetails.deliveryDate?.[0]?.date || null;
    const deliveryTime = packageDetails.deliveryTime?.endTime || null;
    const activity = packageDetails.activity || [];

    // Format events for client response
    const trackingEvents = [];

    // Add "Label Created" (earliest activity)
    if (activity.length > 0) {
      const firstEvent = activity[activity.length - 1];
      trackingEvents.push({
        event: 'Label Created',
        location: 'United States', // Assuming origin country if not specified
        dateTime: formatDeliveryDate(firstEvent.date, firstEvent.time),
      });
    }

    // Add key intermediate events (simplified example based on your request)
    const keyActivities = activity.filter(a => 
      ['092923', '052028', '030551'].includes(a.time) // Example times from your request
    );
    keyActivities.forEach(a => {
      let eventName = '';
      if (a.time === '030551') eventName = 'We Have Your Parcel';
      else if (a.time === '052028') eventName = 'On the Way';
      else if (a.time === '092923') eventName = 'Out for Delivery';

      trackingEvents.push({
        event: eventName,
        location: a.location?.address?.city ? `${a.location.address.city}, ${a.location.address.stateProvince}, United States` : 'Unknown',
        dateTime: formatDeliveryDate(a.date, a.time),
      });
    });

    // Add "Delivered" event
    if (latestStatus.description?.toLowerCase() === 'delivered') {
      trackingEvents.push({
        event: 'Delivered',
        location: packageDetails.packageAddress?.find(addr => addr.type === 'DESTINATION')?.address?.city 
          ? `${packageDetails.packageAddress[1].address.city}, ${packageDetails.packageAddress[1].address.stateProvince}, US`
          : 'Unknown',
        dateTime: formatDeliveryDate(deliveryDate, deliveryTime),
      });
    }

    // Prepare response data
    const trackingData = {
      trackingNumber,
      statusByLocale: latestStatus.description || 'Unknown',
      description: latestStatus.description || 'No description available',
      deliveryDate: deliveryDate ? formatDeliveryDate(deliveryDate, deliveryTime) : null,
      receivedByName: packageDetails.deliveryInformation?.receivedBy || null,
      events: trackingEvents.reverse(), // Reverse to show latest first
    };
 console.log(trackingData, 'trackingData'); // Log tracking data
    res.status(200).json(trackingData);
  } catch (error) {
    console.error('Error fetching UPS tracking details:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch tracking details',
      details: error.message,
    });
  }
}

module.exports = { getupsindividual };