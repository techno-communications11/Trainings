const fs = require('fs');
const csv = require('csv-parser');
const { fetchTrackingDetails } = require('../services/fedexService');

exports.processUpload = async (req, res) => {
  const filePath = req.file.path;
  const trackingNumbers = [];
  let headersValidated = false;

  // Get user_id from auth (replace with your actual auth logic, e.g., req.user.id)
  const userId = req.user ? req.user.id : 1; // Fallback to 1 if no auth

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('headers', (headers) => {
      if (headers.length !== 1 || headers[0] !== 'TrackingNumber') {
        fs.unlinkSync(filePath);
        return res.status(400).json({ 
          error: 'Invalid header. Use header as "TrackingNumber".'
        });
      }
      headersValidated = true;
    })
    .on('data', (row) => {
      if (headersValidated) {
        trackingNumbers.push(row['TrackingNumber']);
      }
    })
    .on('end', async () => {
      if (!headersValidated) return;

      console.log('CSV file successfully processed.');

      try {
        const trackingDetails = await fetchTrackingDetails(trackingNumbers, userId);

        res.status(200).json({
          message: 'Tracking details fetched and stored successfully.',
          data: trackingDetails,
        });

        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error processing file:', error.message);
        res.status(500).json({ error: 'Error processing the file.' });
      }
    })
    .on('error', (error) => {
      console.error('CSV processing error:', error.message);
      res.status(500).json({ error: 'Error reading the CSV file.' });
      fs.unlinkSync(filePath);
    });
};