const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../db.js');

const handleCrediantalsFileUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No files were uploaded.' });
  }

  // Use the stored file path from Multer (req.file.path)
  const filePath = req.file.path;

  // Verify file exists
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({ message: 'Uploaded file not found.' });
  }

  // Read and parse the CSV file
  const results = [];
  fs.createReadStream(filePath)
    .pipe(
      csv({
        // Normalize headers to match database column names
        mapHeaders: ({ header }) =>
          header.replace(/\s+/g, '').toLowerCase(), // Convert headers to lowercase
      })
    )
    .on('data', (data) => {
      // Trim spaces from all values in the row
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value.trim()])
      );
      results.push(cleanedData);
    })
    .on('end', () => {
      // Step 1: Truncate the table
      const truncateSQL = 'TRUNCATE TABLE credentials';
      db.query(truncateSQL, (truncateErr) => {
        if (truncateErr) {
          console.error('Failed to truncate the table:', truncateErr);
          return res.status(500).json({ message: 'Failed to truncate the table.' });
        }


        // Step 2: Insert new data using INSERT IGNORE to skip duplicates
        const insertPromises = results.map((row) => {
          const ntid = row.ntid; // Match database column name
          const doorcode = row.doorcode; // Match database column name
          const name = row.name; // Make sure it's extracting the name correctly

          const sql = 'INSERT IGNORE INTO credentials (ntid, doorcode, Name) VALUES (?, ?, ?)';
          return new Promise((resolve, reject) => {
            db.query(sql, [ntid, doorcode, name], (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
        });

        // Wait for all insertions to complete
        Promise.allSettled(insertPromises)
          .then((results) => {
            const failedInserts = results.filter((result) => result.status === 'rejected');
            if (failedInserts.length > 0) {
              console.warn(`${failedInserts.length} rows failed to insert.`);
            }

            // Remove the uploaded file after data insertion
            try {
              fs.unlinkSync(filePath); // Remove the file
              // console.log(`File ${filePath} deleted successfully.`);
            } catch (err) {
              console.error(`Error deleting file: ${err}`);
            }

            res.status(200).json({
              message: 'File uploaded successfully and data inserted into database.',
              failedInsertsCount: failedInserts.length,
            });
          })
          .catch((error) => {
            console.error('Error during database insertion:', error);
            res.status(500).json({ message: 'Error during database insertion.' });
          });
      });
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(400).json({ message: 'Failed to parse the uploaded file.' });
    });
};

module.exports = { handleCrediantalsFileUpload };