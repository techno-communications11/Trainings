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
  origin: process.env.Client_URL || 'https://training.techno-communications.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsRouter = require('./routes/uploads.router.js');
app.use('/photos', uploadsRouter);

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      success: false, 
      error: 'File size exceeds maximum limit of 10MB' 
    });
  }
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});