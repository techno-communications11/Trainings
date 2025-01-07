  // db.js
  const mysql = require('mysql2');
  const dotenv = require('dotenv');

  dotenv.config();

  const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  // Adjust according to your needs
    queueLimit: 0,
  });
  
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error establishing a connection to the database:', err.message || err);
      return;
    }
    console.log('Connected to the MySQL database.');
    connection.release();
  });
  
  module.exports = db;
  
