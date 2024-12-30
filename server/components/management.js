// components/management.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../db.js');

const handleManagementFileUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No files were uploaded.' });
  }

  const file1Path = path.join('uploads', req.file.originalname);

  // Read and parse the CSV file
  const results = [];
  fs.createReadStream(file1Path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Step 1: Truncate the table before inserting new data
      const truncateSQL = 'TRUNCATE TABLE management';
      db.query(truncateSQL, (truncateErr) => {
        if (truncateErr) {
          console.error('Failed to truncate the table:', truncateErr);
          return res.status(500).json({ message: 'Failed to truncate the table.' });
        }

        console.log('Table truncated successfully.');

        // Step 2: Insert new data into the table
        const insertPromises = results.map((row) => {
          const Market = row.Market; // Assuming the CSV has a column named 'market'
          const Name = row.Name; // Assuming the CSV has a column named 'name'
          const Ntid = row.Ntid; // Assuming the CSV has a column named 'ntid'

          const sql = 'INSERT INTO management (Market, Name, Ntid) VALUES (?, ?, ?)';
          return new Promise((resolve, reject) => {
            db.query(sql, [Market, Name, Ntid], (err, result) => {
              if (err) {
                console.error('Database insertion failed:', err);
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

module.exports = { handleManagementFileUpload };
