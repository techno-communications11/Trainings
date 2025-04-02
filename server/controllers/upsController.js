const fs = require('fs');
const csv = require('csv-parser');
const { getUpsTrackingDetails } = require('../services/upsServices');

exports.upsprocessUpload = async (req, res) => {
  const filePath = req.file.path;
  const trackingNumbers = [];

  // Get user_id from auth (replace with your actual auth logic)
  const userId = req.user.id; // Fallback to 1 if no auth

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
        const trackingDetails = await new Promise((resolve, reject) => {
          getUpsTrackingDetails(trackingNumbers, userId, (err, details) => {
            if (err) reject(err);
            else resolve(details);
          });
        });

        res.status(200).json({
          message: 'Tracking details fetched and stored successfully.',
          data: trackingDetails,
        });

        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error processing file:', error.message);
        res.status(500).send('Error processing the file.');
      }
    })
    .on('error', (error) => {
      console.error('CSV processing error:', error.message);
      res.status(500).send('Error reading the CSV file.');
      fs.unlinkSync(filePath);
    });
};