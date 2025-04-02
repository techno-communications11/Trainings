const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db').promise(); // 👈 Use .promise() to enable async/await

async function Login(req, res) {
  const { email, password } = req.body;
  console.log('Login request received:', req.body);
  

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]); // ✅ Now properly returns [rows]
    console.log('Database query results:', rows);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { 
        id: user.id,        // ← Must be included
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7*24*60 * 60 * 1000,
    });

    return res.status(200).json({ 
      message: 'Login successful.',
      user: { id: user.id, email: user.email, department: user.role}
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ 
      error: 'An error occurred during login.',
      details: error.message 
    });
  }
}

module.exports = Login;