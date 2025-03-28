const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const db = require("../db.js");

const handleManagementFileUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No files were uploaded." });
  }

  const file1Path = req.file.path;

  // Read and parse the CSV file
  const results = [];
  fs.createReadStream(file1Path)
    .pipe(csv())
    .on("data", (data) => {
      console.log("Row:", data); // Debug log
      results.push(data);
    })
    .on("end", () => {
      console.log("Parsed results:", results); // Debug log

      // Step 1: Truncate the table before inserting new data
      const truncateSQL = "TRUNCATE TABLE management";
      db.query(truncateSQL, (truncateErr) => {
        if (truncateErr) {
          console.error("Failed to truncate the table:", truncateErr);
          return res
            .status(500)
            .json({ message: "Failed to truncate the table." });
        }

        console.log("Table truncated successfully.");

        // Step 2: Insert new data into the table
        const insertPromises = results.map((row) => {
          const Name = row.Name;
          const Login = row.Login;

          console.log("Inserting row:", Name, Login); // Debug log

          const sql = "INSERT INTO management (Name, Login) VALUES (?, ?)";
          return new Promise((resolve, reject) => {
            db.query(sql, [Name, Login], (err, result) => {
              if (err) {
                console.error("Database insertion failed:", err);
                reject(err);
              } else {
                console.log("Inserted row ID:", result.insertId); // Debug log
                resolve(result);
              }
            });
          });
        });

        // Wait for all insertions to complete
        Promise.allSettled(insertPromises)
          .then((results) => {
            const failedInserts = results.filter(
              (result) => result.status === "rejected"
            );
            if (failedInserts.length > 0) {
              console.warn(`${failedInserts.length} rows failed to insert.`);
            }
            try {
              fs.unlinkSync(file1Path); // Remove the file
              console.log(`File ${file1Path} deleted successfully.`);
            } catch (err) {
              console.error(`Error deleting file: ${err}`);
            }
            res.status(200).json({
              message:
                "File uploaded successfully and data inserted into database.",
              failedInsertsCount: failedInserts.length,
            });
          })
          .catch((error) => {
            console.error("Error during database insertion:", error);
            res
              .status(500)
              .json({ message: "Error during database insertion." });
          });
      });
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
      res.status(400).json({ message: "Failed to parse the uploaded file." });
    });
};

module.exports = { handleManagementFileUpload };
