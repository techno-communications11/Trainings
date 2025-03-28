const db = require('../db'); // Assuming db is using the non-promise mysql2

// Replace bcrypt with bcryptjs
const bcrypt = require('bcryptjs');

 // To hash passwords

// The Register function
const Register = (req, res) => {
  const { email, password ,role} = req.body;

  if (!email || !password || !role) {
    // Check if all required fields are provided
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Check if the user already exists
  const userCheckQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(userCheckQuery, [email], (err, userCheckResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (userCheckResult.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error hashing password' });
      }

      // Insert the new user into the database
      const insertQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?,?)';
      db.query(insertQuery, [email, hashedPassword,role], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error inserting user' });
        }

        // Respond with the new user data (no token)
        res.status(201).json({
          message: 'Registration successful! Please login with your credentials.',
          user: {
            id: result.insertId,
            email: email,
          }
        });
      });
    });
  });
};

module.exports = { Register };
