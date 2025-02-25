const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const db = require("../db.js");

const requiredAssignments = [
  "Ready Express Payments, Introduction",
  "Ready Express Payments, Payment Options",
  "Ready! Express | Activations Overview",
  "Ready! Express | Dealer Support Group AAL OBO",
  "Ready! Express | Metro Flex",
  "Ready! Express | Payments Overview",
  "Ready! Express | Troubleshooting Overview",
  "Ready! Express | Upgrades Overview",
  "Ready! Express | Welcome Overview",
  "Ready! Express Activations, Device Protection",
  "Ready! Express Activations, Introduction",
  "Ready! Express Troubleshooting, Introduction",
  "Ready! Express Troubleshooting, Returns & Exchanges",
  "Ready! Express Upgrades, Big 5 Review",
  "Ready! Express Upgrades, Introduction",
  "Ready! Express Welcome, Introduction",
  "Ready! Express Welcome, Systems Overview",
  "Ready! Express | Activations",
  "Ready! Express | Payments",
  "Ready! Express | Troubleshooting",
  "Ready! Express | Upgrades",
  "Ready! Express | Welcome",
];

const rdmAssignments = [
  "Ready! Express | Self-Paced New Hire Training",
  "Ready! Express | Leader Connect",
];

function processAssignments(assignments) {
  const allRequiredCompleted = requiredAssignments.every((reqAssignment) => {
    const found = assignments.find((a) => a.assignmentName === reqAssignment);
    return found && found.status === "Completed";
  });

  const rdmAssignmentsIncomplete = rdmAssignments.some((rdmAssignment) => {
    const found = assignments.find((a) => a.assignmentName === rdmAssignment);
    return found && found.status === "Incomplete";
  });

  const hasIncompleteRequired = assignments.some(
    (assignment) =>
      !assignment.assignmentName.toLowerCase().includes("optional") &&
      (assignment.status === "Not Attempted" ||
        assignment.status === "Incomplete")
  );

  return {
    needsTrainingApproval: hasIncompleteRequired,
    needsRDMApproval: allRequiredCompleted && rdmAssignmentsIncomplete,
  };
}

function handleFileUpload(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: "No files were uploaded." });
  }

  const file1Path = path.join("uploads", req.files.file1[0].originalname);
  const file2Path = path.join("uploads", req.files.file2[0].originalname);

  const matchedRows = [];
  const rdmApproval = new Set();
  const trainingApproval = new Set();

  const loginsToMatch = new Map();
  const userAssignments = new Map();

  // Step 1: Parse first file to get incomplete logins and their Assigned Date
  fs.createReadStream(file1Path)
    .pipe(csv())
    .on("data", (row) => {
      if (row["Completion Status"] === "Not Complete") {
        loginsToMatch.set(row["Login"], row["Assigned Date"]);
      }
    })
    .on("end", () => {
      // Step 2: Parse second file for detailed assignment data
      fs.createReadStream(file2Path)
        .pipe(csv())
        .on("data", (row) => {
          const login = row["Login"];
          if (loginsToMatch.has(login)) {
            matchedRows.push(row);

            if (!userAssignments.has(login)) {
              userAssignments.set(login, []);
            }
            userAssignments.get(login).push({
              assignmentName: row["Assignment Name"],
              status: row["Status"],
            });
          }
        })
        .on("end", () => {
          // Process all assignments after collecting all data
          for (const [login, assignments] of userAssignments) {
            const { needsTrainingApproval, needsRDMApproval } =
              processAssignments(assignments);

            if (needsRDMApproval) {
              rdmApproval.add(login);
            } else if (needsTrainingApproval) {
              trainingApproval.add(login);
            }
          }

          // Clean up uploaded files
          try {
            fs.unlinkSync(file1Path);
            fs.unlinkSync(file2Path);
            console.log("Files removed from the upload folder.");
          } catch (err) {
            console.error("Failed to delete files from upload folder:", err);
          }

          // Truncate trainingreport table
          const truncateSQL = "TRUNCATE TABLE trainingreport";
          db.query(truncateSQL, (truncateErr) => {
            if (truncateErr) {
              console.error("Failed to truncate the table:", truncateErr);
              return res.status(500).json({
                message: "Failed to truncate the table.",
              });
            }

            console.log("Table truncated successfully.");

            // Prepare data for database insertion
            const insertData = [];

            rdmApproval.forEach((login) => {
              insertData.push([login, loginsToMatch.get(login), "RDM Approval"]);
            });

            trainingApproval.forEach((login) => {
              if (!rdmApproval.has(login)) {  // Ensure no duplicates
                insertData.push([
                  login,
                  loginsToMatch.get(login),
                  "Training Pending",
                ]);
              }
            });

            if (insertData.length > 0) {
              const insertSQL =
                "INSERT INTO trainingreport (Ntid, AssignedDate, Status) VALUES ?";
              db.query(insertSQL, [insertData], (insertErr) => {
                if (insertErr) {
                  console.error(
                    "Database insertion failed for insertData:",
                    insertErr
                  );
                  return res.status(500).json({
                    message: "Database insertion failed.",
                  });
                }

                console.log("Data inserted successfully.");
                // Send response
                res.status(200).json({
                  message: "Files processed successfully!",
                  matchedRows,
                  rdmApproval: Array.from(rdmApproval),
                  trainingApproval: Array.from(trainingApproval),
                });
              });
            } else {
              res.status(200).json({
                message: "No data to insert.",
                matchedRows,
                rdmApproval: Array.from(rdmApproval),
                trainingApproval: Array.from(trainingApproval),
              });
            }
          });
        })
        .on("error", (error) => {
          console.error("Error parsing second file:", error);
          res.status(400).json({ message: "Failed to parse the second file." });
        });
    })
    .on("error", (error) => {
      console.error("Error parsing first file:", error);
      res.status(400).json({ message: "Failed to parse the first file." });
    });
}

module.exports = { handleFileUpload };
