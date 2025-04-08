const fs = require('fs');
const csv = require('csv-parser');
const { getUpsTrackingDetails } = require('../services/upsServices');

exports.upsprocessUpload = async (req, res) => {
  console.log('Starting UPS processUpload');
  const filePath = req.file.path;
  const trackingNumbers = [];
  const userId = req.user?.id || 1;

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headers) => {
          if (headers.length !== 1 || headers[0] !== 'TrackingNumber') {
            reject(new Error('Invalid header. CSV must have single column "TrackingNumber"'));
          }
        })
        .on('data', (row) => {
          const trackingNumber = row['TrackingNumber'];
          if (trackingNumber && trackingNumber.trim() !== '') {
            trackingNumbers.push(trackingNumber);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (trackingNumbers.length === 0) {
      return res.status(400).json({ error: 'No valid tracking numbers found in CSV' });
    }

    // Set headers for streaming response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    getUpsTrackingDetails(trackingNumbers, userId, (err, progress) => {
      if (err) {
        res.write(JSON.stringify({ error: err.message, status: 'error' }) + '\n');
        res.end();
        fs.unlinkSync(filePath);
        return;
      }

      // Send progress updates as JSON chunks
      res.write(JSON.stringify(progress) + '\n');

      if (progress.status === 'complete' || progress.status === 'error') {
        res.end();
        fs.unlinkSync(filePath);
      }
    });

  } catch (error) {
    console.error('Error processing CSV:', error.message);
    res.status(500).json({ error: 'Error processing the file.' });
    fs.unlinkSync(filePath);
  }
};