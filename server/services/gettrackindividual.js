const axios = require('axios');

function formatDateTime(rawDateTime) {
  return rawDateTime; // Return the exact ISO string as received from FedEx API, e.g., "2025-03-18T17:36:24-07:00"
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

    const trackResult = trackResponse.data.output.completeTrackResults[0].trackResults[0];
    console.log('Raw Track Result:', trackResult); // Debugging line to verify API response
    if (!trackResult) throw new Error('No tracking data found');

    const latestStatus = trackResult.latestStatusDetail || {};
    const dateAndTimes = trackResult.dateAndTimes || [];
    const scanEvents = trackResult.scanEvents || [];
    const deliveryDetails = trackResult.deliveryDetails || {};
    const packageDetails = trackResult.packageDetails || {};
    const serviceDetail = trackResult.serviceDetail || {};
    const weight = packageDetails.weightAndDimensions?.weight?.[0] || {};

    const status = latestStatus.statusByLocale?.toLowerCase() || '';
    let actualDeliveryDate = null;
    let estimatedDeliveryDate = null;
    let outForDeliveryDate = null;

    // Extract dates directly from API response without modification
    actualDeliveryDate = dateAndTimes.find((item) => item.type === 'ACTUAL_DELIVERY')?.dateTime || null;
    estimatedDeliveryDate = dateAndTimes.find((item) => item.type === 'ESTIMATED_DELIVERY')?.dateTime || null;
    outForDeliveryDate = scanEvents.find((e) => e.eventDescription.toLowerCase().includes('on fedex vehicle for delivery'))?.date || null;

    const trackingEvents = scanEvents.map((event) => ({
      event: event.eventDescription,
      location: `${event.scanLocation?.city || 'Unknown'}, ${event.scanLocation?.stateOrProvinceCode || ''}`.toUpperCase(),
      dateTime: formatDateTime(event.date), // Keep exact API timestamp
      derivedStatus: event.derivedStatus || 'Unknown',
    }));

    const trackingData = {
      trackingNumber,
      statusByLocale: latestStatus.statusByLocale || 'Unknown',
      description: latestStatus.description || 'No description available',
      actualDeliveryDate: actualDeliveryDate, // Exact as received from API
      estimatedDeliveryDate: estimatedDeliveryDate, // Exact as received from API
      outForDeliveryDate: outForDeliveryDate, // Exact as received from API
      deliveryAttempts: deliveryDetails.deliveryAttempts || '0',
      receivedByName: deliveryDetails.receivedByName || null,
      serviceType: serviceDetail.description || 'FedEx',
      packaging: packageDetails.packagingDescription?.description || 'Package',
      weight: `${weight.value || 'Unknown'} ${weight.units || ''}`,
      shipperCity: trackResult.shipperInformation?.address?.city || 'Unknown',
      recipientCity: trackResult.recipientInformation?.address?.city || 'Unknown',
      events: trackingEvents.reverse(), // Latest first
    };

    console.log('Processed Tracking Data:', trackingData); // Debug processed data
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