const multer = require('multer');
const fs = require('fs');

// Check if the uploads directory exists, if not, create it
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original file name
  },
});

const upload = multer({ storage });

module.exports = upload;
