// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const uploadsRouter = require('./routes/uploads.router'); // Adjust the path as needed
const db = require('./db.js');
dotenv.config();

const app = express();
const port = 4501;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// Use the uploads router for handling routes starting with /photos
app.use('/photos', uploadsRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
