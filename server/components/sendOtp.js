const { Resend } = require('resend'); // Use require instead of import
const db = require('../db'); // Using require for db module

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtp = async (req, res) => {
  const { email } = req.body;

  console.log('Request Body:', req.body); // Log the body to ensure email is passed

  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiry time (15 minutes from now)
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // Convert to ISO string

    // Update OTP and expiry in the database
    try {
      const result = await db.execute(
        `UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?`,
        [otp, otpExpiry, email]
      );

      console.log('Database result:', result);

      // Check if the result object contains 'affectedRows'
      if (result && result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ message: 'Database error' });
    }

    // Send OTP email using Resend
    const emailResponse = await resend.emails.send({
      from: 'ticketing@techno-communications.com', // Use a verified email here
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>This code is valid for 15 minutes.</p>`,
    });
    

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      return res.status(500).json({ message: 'Failed to send OTP email', error: emailResponse.error });
    } else if (emailResponse.data) {
      console.log('Email sent successfully:', emailResponse.data); // Log the successful response
    }

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

module.exports = sendOtp; // Use module.exports instead of export default
