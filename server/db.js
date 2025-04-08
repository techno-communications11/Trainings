const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectTimeout: 60000, // 60 seconds
  acquireTimeout: 60000, // 60 seconds
  multipleStatements: true,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Error establishing a connection to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
  connection.release();
});

module.exports = db;