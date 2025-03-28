const db = require('../db').promise();

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    const [rows] = await db.query(
      `SELECT otp, otp_expiry FROM users WHERE email = ?`,
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { otp: storedOtp, otp_expiry: otpExpiry } = rows[0];

    // Validate OTP
    if (otp !== storedOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Get current time in UTC to match database time
    const currentTime = new Date();
    const expiryTime = new Date(otpExpiry);

    // Add debugging logs
    console.log(`Current time (UTC): ${currentTime.toISOString()}`);
    console.log(`OTP expiry time: ${expiryTime.toISOString()}`);
    console.log(`Time difference (ms): ${expiryTime - currentTime}`);

    // Validate OTP expiry with buffer (1 minute grace period)
    if (currentTime > expiryTime) {
      return res.status(400).json({ 
        message: 'OTP has expired',
        details: {
          currentTime: currentTime.toISOString(),
          expiryTime: expiryTime.toISOString()
        }
      });
    }

    // Clear the OTP after successful verification
    await db.query(
      `UPDATE users SET otp = NULL, otp_expiry = NULL WHERE email = ?`,
      [email]
    );

    res.status(200).json({ message: 'OTP verified successfully' });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

module.exports = { verifyOtp };