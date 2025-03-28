const bcrypt = require('bcrypt');
const db = require('../db'); // Use .promise() to enable async/await

const updatepassword = (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body,"bbb sdvh")

  // Hash the password before saving to the database
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ message: 'Error hashing password.' });
    }

    const query = 'UPDATE users SET password = ? WHERE email = ?';
    db.query(query, [hashedPassword, email], (err, results) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ message: 'Error updating password.' });
      }
      console.log('Password updated successfully:', results);
      res.status(200).json({ message: 'Password updated successfully.' });
    });
  });
};

module.exports = updatepassword;
