const fs = require('fs');
const csv = require('csv-parser');
const { fetchTrackingDetails } = require('../services/fedexService');

exports.processUpload = async (req, res) => {
  console.log('Starting FedEx processUpload');
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

    fetchTrackingDetails(trackingNumbers, userId, (err, progress) => {
      if (err) {
        console.error('FedEx processing error:', err);
        res.write(JSON.stringify({ 
          error: err.message, 
          status: 'error',
          current: progress?.current || 0,
          total: progress?.total || trackingNumbers.length
        }) + '\n');
        res.end();
        fs.unlinkSync(filePath);
        return;
      }

      // Send progress update
      res.write(JSON.stringify(progress) + '\n');

      if (progress.status === 'complete' || progress.status === 'error') {
        res.end();
        fs.unlinkSync(filePath);
      }
    });

  } catch (error) {
    console.error('Error processing FedEx CSV:', error);
    res.status(500).json({ error: error.message });
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};