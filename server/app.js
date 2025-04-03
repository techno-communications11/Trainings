const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 4501;

const corsOptions = {
  origin: process.env.Client_URL 
  || 'https://training.techno-communications.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Required for cookies/auth tokens
  optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(cookieParser());
app.use(cors(corsOptions)); // Apply CORS globally
app.use(morgan('dev'));
app.use(express.json()); // Removed the limit
app.use(express.urlencoded({ extended: true })); // Removed the limit
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsRouter = require('./routes/uploads.router.js');
app.use('/photos', uploadsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'File size exceeds maximum limit' });
  }
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});