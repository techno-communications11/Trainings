const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 4501;

// Security middleware
app.use(helmet());
app.use(cookieParser());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later'
// });
// app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

// Request logging
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const uploadsRouter = require('./routes/uploads.router.js');

app.use('/photos', uploadsRouter);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle Multer errors specifically
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      success: false,
      error: 'File size exceeds maximum limit' 
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      success: false,
      error: 'Too many files uploaded' 
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      success: false,
      error: 'Unexpected file field' 
    });
  }

  res.status(500).json({ 
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS allowed origin: ${corsOptions.origin}`);
});