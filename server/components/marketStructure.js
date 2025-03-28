const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../db.js');

const handleMarketStructureFileUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No files were uploaded.' });
  }

  const filePath = req.file.path;
  const results = [];

  // Read and parse the CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      results.push({
        mainstore: data['Store Name'] || '',
        dm: data['DM Name'] || '',
        doorcode: data['Door Code'] || '',
        Market: data['Market'] || ''
      });
    })
    .on('end', () => {
      // Get a database connection
      db.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting database connection:', err);
          try { fs.unlinkSync(filePath); } catch (e) {}
          return res.status(500).json({ message: 'Database connection failed' });
        }

        // Begin transaction
        connection.beginTransaction((beginErr) => {
          if (beginErr) {
            connection.release();
            try { fs.unlinkSync(filePath); } catch (e) {}
            return res.status(500).json({ message: 'Transaction failed to start' });
          }

          // Step 1: Truncate the table
          connection.query('TRUNCATE TABLE marketstructure', (truncateErr) => {
            if (truncateErr) {
              return connection.rollback(() => {
                connection.release();
                try { fs.unlinkSync(filePath); } catch (e) {}
                res.status(500).json({ message: 'Failed to truncate table' });
              });
            }

            // Step 2: Insert the new data in batches if there are results
            if (results.length === 0) {
              return connection.commit((commitErr) => {
                connection.release();
                try { fs.unlinkSync(filePath); } catch (e) {}
                if (commitErr) {
                  return res.status(500).json({ message: 'Commit failed' });
                }
                res.status(200).json({ message: 'No data to insert' });
              });
            }

            const insertQuery = 'INSERT INTO marketstructure (mainstore, dm, doorcode, Market) VALUES ?';
            connection.query(insertQuery, [results.map(r => [r.mainstore, r.dm, r.doorcode, r.Market])], (insertErr) => {
              if (insertErr) {
                return connection.rollback(() => {
                  connection.release();
                  try { fs.unlinkSync(filePath); } catch (e) {}
                  res.status(500).json({ message: 'Insert failed' });
                });
              }

              // Commit transaction
              connection.commit((commitErr) => {
                connection.release();
                try { fs.unlinkSync(filePath); } catch (e) {}
                
                if (commitErr) {
                  return res.status(500).json({ message: 'Commit failed' });
                }
                
                res.status(200).json({
                  message: 'File processed successfully',
                  recordsInserted: results.length
                });
              });
            });
          });
        });
      });
    })
    .on('error', (err) => {
      console.error('Error reading the file:', err);
      try { fs.unlinkSync(filePath); } catch (e) {}
      res.status(500).json({ message: 'Failed to process the file' });
    });
};

module.exports = { handleMarketStructureFileUpload };