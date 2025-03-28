const fs = require('fs');
const csv = require('csv-parser');
const { getUpsTrackingDetails } = require('../services/upsServices');

exports.upsprocessUpload = async (req, res) => {
  const filePath = req.file.path;
  console.log(filePath, 'fppppp');
  const trackingNumbers = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const trackingNumber = row['TrackingNumber'];
      if (trackingNumber && trackingNumber.trim() !== '') {
        trackingNumbers.push(trackingNumber);
      } else {
        console.error('Skipping invalid or empty tracking number:', trackingNumber);
      }
    })
    .on('end', async () => {
      console.log('CSV file successfully processed.');

      try {
        const trackingDetails = await getUpsTrackingDetails(trackingNumbers);

        // Send response to client
        res.status(200).json({
          message: 'Tracking details fetched and stored successfully.',
          data: trackingDetails,
        });

        // Cleanup uploaded file
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error processing file:', error.message);
        res.status(500).send('Error processing the file.');
      }
    });
};