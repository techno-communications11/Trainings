const db = require('../db'); // Import the connection pool

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  // console.log('Request body:', req.body);

  try {
    // Get a connection from the pool
    db.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection:', err.message || err);
        return res.status(500).json({ message: 'Database connection failed' });
      }

      // Use promise-based queries
      connection
        .promise()
        .query(`SELECT otp, otp_expiry FROM users WHERE email = ?`, [email])
        .then(([rows]) => {
          console.log('Query Result:', rows);

          if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
          }

          const { otp: storedOtp, otp_expiry: otpExpiry } = rows[0];
          console.log('Stored OTP:', storedOtp);
          console.log('Incoming OTP:', otp);

          // Validate OTP
          if (otp !== storedOtp) {
            return res.status(400).json({ message: 'Invalid OTP' });
          }

          // Validate OTP expiry
          const currentTime = new Date();
          if (currentTime > new Date(otpExpiry)) {
            return res.status(400).json({ message: 'OTP has expired' });
          }

          res.status(200).json({ message: 'OTP verified successfully' });
        })
        .catch(error => {
          console.error('Error executing query:', error);
          res.status(500).json({ message: 'Failed to verify OTP' });
        })
        .finally(() => {
          // Release the connection back to the pool
          connection.release();
        });
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { verifyOtp };
