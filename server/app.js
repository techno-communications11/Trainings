// app.js (Backend)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const uploadsRouter = require('./routes/uploads.router');
dotenv.config();

const app = express();
const port = 4501;

app.use(cors({
  origin: `${process.env.Client_URL}`,  // Adjust according to your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json()); // Middleware to parse JSON requests

// Use the uploads router for handling routes starting with /photos
app.use('/photos', uploadsRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
