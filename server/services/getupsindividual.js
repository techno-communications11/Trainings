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
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-05:00`; // Assuming CDT for consistency
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

    const shipment = trackResponse.data?.trackResponse?.shipment?.[0];
    if (!shipment) {
      throw new Error('No shipment data found');
    }

    const packageDetails = shipment.package?.[0];
    if (!packageDetails) {
      throw new Error('No package details available');
    }

    const latestStatus = packageDetails.currentStatus || {};
    const deliveryDate = packageDetails.deliveryDate?.[0]?.date || null;
    const deliveryTime = packageDetails.deliveryTime?.endTime || null;
    const activity = packageDetails.activity || [];

    // Map UPS activities to events
    const trackingEvents = activity.map((a) => ({
      event: a.status?.type === 'I' && a.status?.description === 'Origin Scan'
        ? 'Order Processed: Ready for UPS'
        : a.status?.description || 'Unknown',
      location: a.location?.address?.city
        ? `${a.location.address.city}, ${a.location.address.stateProvince || ''}, US`
        : 'Unknown',
      dateTime: formatDeliveryDate(a.date, a.time),
    }));

    // Find the last "Delivered" or "DELIVERED" event from activities
    const deliveredEvent = trackingEvents.findLast(e => e.event.toLowerCase().includes('delivered'));
    const deliveryDateTime = deliveredEvent ? deliveredEvent.dateTime : formatDeliveryDate(deliveryDate, deliveryTime);

    const trackingData = {
      trackingNumber,
      statusByLocale: latestStatus.description || 'Unknown',
      description: latestStatus.description || 'No description available',
      deliveryDate: deliveryDateTime, // Use the last delivered event date or fallback to deliveryDate
      deliveryAttempts: packageDetails.deliveryInformation?.attempts || '0',
      receivedByName: packageDetails.deliveryInformation?.receivedBy || null,
      serviceType: shipment.service?.description || 'UPS', // Corrected to 'UPS' as default
      weight: packageDetails.weight?.displayWeight || 'Unknown',
      shipperCity: shipment.shipperAddress?.city || 'Unknown',
      recipientCity: packageDetails.packageAddress?.find(addr => addr.type === 'DESTINATION')?.address?.city || 'Unknown',
      events: trackingEvents.reverse(), // Latest first, like UPS
    };

    console.log('Raw API Response:', trackResponse.data); // Debug raw response
    console.log('Processed Tracking Data:', trackingData); // Debug final data
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