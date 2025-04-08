const fs = require('fs');
const csv = require('csv-parser');
const { fetchTrackingDetails } = require('../services/fedexService');

exports.processUpload = async (req, res) => {
  console.log('Starting FedEx processUpload');
  const filePath = req.file.path;
  console.log('File path:', filePath);
  const trackingNumbers = [];
  let headersValidated = false;

  const userId = req.user?.id || 1; // Fallback to 1 if no auth
  console.log('userId:', userId);

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headers) => {
          console.log('CSV headers:', headers);
          if (headers.length !== 1 || headers[0] !== 'TrackingNumber') {
            console.error('Invalid header detected');
            reject(new Error('Invalid header. Use header as "TrackingNumber".'));
          }
          headersValidated = true;
          console.log('Headers validated');
        })
        .on('data', (row) => {
          if (headersValidated) {
            console.log('CSV row:', row);
            trackingNumbers.push(row['TrackingNumber']);
          }
        })
        .on('end', resolve)
        .on('error', (error) => {
          console.error('CSV parsing error:', error.message);
          reject(error);
        });
    });

    if (!headersValidated) {
      console.log('No valid headers found');
      throw new Error('No valid headers found in CSV');
    }

    if (trackingNumbers.length === 0) {
      console.log('No valid tracking numbers found');
      throw new Error('No valid tracking numbers found in CSV');
    }

    console.log('CSV file processed. Tracking numbers:', trackingNumbers);

    // Set up streaming response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Start with an opening array bracket
    res.write('[');

    let isFirstChunk = true;

    fetchTrackingDetails(trackingNumbers, userId, (err, progress) => {
      if (err) {
        console.error('Error in FedEx processing:', err.message);
        if (!isFirstChunk) res.write(',');
        res.write(JSON.stringify({
          error: err.message,
          status: 'error',
          total: progress.total,
          current: progress.current,
          trackingDetails: progress.trackingDetails,
        }));
        res.write(']'); // Close the array
        res.end();
        fs.unlinkSync(filePath);
        return;
      }

      try {
        // Add a comma before each new chunk except the first
        if (!isFirstChunk) res.write(',');
        else isFirstChunk = false;

        // Send the progress object as a JSON string
        res.write(JSON.stringify(progress));

        if (progress.status === 'complete' || progress.status === 'error') {
          res.write(']'); // Close the array
          res.end();
          fs.unlinkSync(filePath);
          console.log('Temporary file deleted');
        }
      } catch (writeError) {
        console.error('Error writing JSON chunk:', writeError.message);
        res.write(',{"error":"Server error while streaming response"}]');
        res.end();
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error('Error in processUpload:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
    fs.unlinkSync(filePath);
  }
};