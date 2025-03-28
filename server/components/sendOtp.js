const { Resend } = require('resend');
const db = require('../db').promise();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtp = async (req, res) => {
  const { email } = req.body;

  // Validate email presence and format
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required and must be a valid string' });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  try {
    // Check if email exists in the database
    const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);
    
    if (!rows || rows.length === 0) {
      console.log('User not found in the database for email:', email);
      return res.status(404).json({ message: 'No account found with this email address' });
    }
   
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update OTP and expiry in the database
    const [updateResult] = await db.execute(
      `UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?`,
      [otp, otpExpiry, email]
    );

    if (!updateResult || updateResult.affectedRows === 0) {
      return res.status(500).json({ message: 'Failed to update OTP for the user' });
    }

    // Send OTP email using Resend
    const emailResponse = await resend.emails.send({
      from: 'ticketing@techno-communications.com',
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>
             <p>This code is valid for 15 minutes.</p>
             <p>If you didn't request this, please ignore this email.</p>`,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      // Rollback the OTP update since email failed
      await db.execute(
        `UPDATE users SET otp = NULL, otp_expiry = NULL WHERE email = ?`,
        [email]
      );
      return res.status(500).json({ 
        message: 'Failed to send OTP email', 
        error: emailResponse.error 
      });
    }

    return res.status(200).json({ 
      message: 'OTP sent successfully',
      // In production, you might not want to send this back
      debugInfo: { emailSentTo: email } 
    });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ 
      message: 'An unexpected error occurred while sending OTP', 
      error: error.message 
    });
  }
};

module.exports = sendOtp; 