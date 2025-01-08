const db = require('../db'); // Update path as per your project structure

const getTrackingDetails = async (req, res) => {
  console.log('Displayed data...');

  try {
    // Step 1: Get all ntid in the management table
    const getManagementQuery = 'SELECT Login FROM management';
    const [managementResults] = await db.promise().query(getManagementQuery);

    // Extract ntid values in the management table
    const managementNtids = managementResults.map((row) => row.Login);
    console.log(managementNtids,'mmmger');

    // Step 2: Get all ntid from the trainingreport table
    const getTrainingReportQuery = 'SELECT Ntid, Status,assignedDate,Date FROM trainingreport';
    const [trainingReportResults] = await db.promise().query(getTrainingReportQuery);

    // Extract ntid values in the trainingreport table
    const trainingReportNtids = trainingReportResults.map((row) => row.Ntid);

    // Step 3: Find NTIDs present in both tables
    const matchingNtids = managementNtids.filter((Login) =>
      trainingReportNtids.includes(Login)
    );

    // Log matching NTIDs in the console
    if (matchingNtids.length > 0) {
      console.log('Matching NTIDs in both management and trainingreport:', matchingNtids);
    } else {
      console.log('No matching NTIDs found between management and trainingreport.');
    }

    const trackingDetails = [];

    // Step 4: Proceed with fetching tracking details for non-management NTIDs
    const doorcodePromises = trainingReportResults.map(async (report) => {
      const ntid = report.Ntid;
      const status = report.Status;
      const assignedDate=report.assignedDate;
      const Date=report.Date;

      // Skip processing if ntid is in management
      if (managementNtids.includes(ntid)) {
        return;
      }

      // Fetch doorcode and name based on ntid
      const getDoorcodeQuery = 'SELECT doorcode, name FROM credentials WHERE ntid = ?';
      const [doorcodeResult] = await db.promise().query(getDoorcodeQuery, [ntid]);

      if (doorcodeResult.length === 0) {
        console.log(`No doorcode found for ntid: ${ntid}`);
        return; // Skip this record if no doorcode
      }

      const doorcode = doorcodeResult[0].doorcode;
      const name = doorcodeResult[0].name; // Get name from credentials

      // Fetch mainstore, doorcode, and dm from marketstructure using doorcode
      const getMarketStructureQuery = `
        SELECT mainstore, doorcode, Market, dm 
        FROM marketstructure 
        WHERE doorcode = ?
      `;
      const [marketStructureResult] = await db.promise().query(getMarketStructureQuery, [doorcode]);

      if (marketStructureResult.length === 0) {
        console.log(`No market structure found for doorcode: ${doorcode}`);
        return; // Skip this record if no market structure
      }

      // Store the result in an array including the name
      trackingDetails.push({
        ntid: ntid,
        assignedDate:assignedDate,
        Date:Date, // Ensure you reference the 'Date' field from trainingreport
        status: status,
        doorcode: doorcode,
        name: name, // Add name to the result
        mainstore: marketStructureResult[0].mainstore,
        dm: marketStructureResult[0].dm,
        Market: marketStructureResult[0].Market,
      });
    });

    // Wait for all doorcode and market structure queries to finish
    await Promise.all(doorcodePromises);

    // Step 5: Send the final response with tracking details
    res.status(200).json({ trackingDetails });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error fetching tracking details' });
  }
};

module.exports = { getTrackingDetails };
