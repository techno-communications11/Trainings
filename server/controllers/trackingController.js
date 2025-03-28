const fs = require('fs');
const csv = require('csv-parser');
const { fetchTrackingDetails } = require('../services/fedexService');

exports.processUpload = async (req, res) => {
  const filePath = req.file.path;
 
  const trackingNumbers = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      trackingNumbers.push(row['TrackingNumber']);
    })
    .on('end', async () => {
      console.log('CSV file successfully processed.');

      try {
        const trackingDetails = await fetchTrackingDetails(trackingNumbers);

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
