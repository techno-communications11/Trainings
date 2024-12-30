const db = require('../db'); // Your database connection file
// Replace bcrypt with bcryptjs
// Replace bcrypt with bcryptjs
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // This will load your .env file

const Login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error, please try again.' });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Error comparing passwords.' });
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        {
          id: result[0].id,
          email: result[0].email,
          role: result[0].role,
        },
        process.env.JWT_SECRET, // This will now use the secret from the .env file
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Login successful!',
        token,
      });
    });
  });
};

module.exports = { Login };
