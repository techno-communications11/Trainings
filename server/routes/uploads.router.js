const express = require('express');
const upload = require('../multer/multer');
const { handleFileUpload } = require('../components/handleFileUpload.js');
const { handleManagementFileUpload } = require('../components/management.js');
const { handleCrediantalsFileUpload } = require('../components/crediantals.js');
const { handleMarketStructureFileUpload } = require('../components/marketStructure.js');
const {getTrackingDetails} = require('../components/getTrackingDetails.js'); // Modified import
const Login = require('../components/Login.js');
const { Register } = require('../components/Register.js');
const updatepassword = require('../components/updatepassword');
const sendOtp = require('../components/sendOtp');
const { verifyOtp } = require('../components/verifyOtp');
const authenticateToken = require('../middleware/authMiddleware.js');
const { getupsindividual } = require('../services/getupsindividual');
const { getAllTrackingData } = require('../services/getAllTrackingData');
const { gettrackindividual } = require('../services/gettrackindividual'); 
const { processUpload } = require('../controllers/trackingController');
const { upsprocessUpload } = require('../controllers/upsController');
const getCurrentUser = require('../components/getCurrentUser.js');
const logout = require('../components/logout.js');
const router = express.Router();


// Authentication routes
router.post('/login', Login);
router.post('/register', Register);
router.put('/update-password', updatepassword);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', authenticateToken, logout);

// File upload routes
router.post('/upload-fedex', authenticateToken, upload.single('file'), processUpload);
router.post('/upload-ups', authenticateToken, upload.single('file'), upsprocessUpload);

// Tracking data routes
router.get('/getalltrackingdata', authenticateToken, getAllTrackingData);
router.post('/gettrackindividual', authenticateToken, gettrackindividual);
router.post('/getupsindividual',authenticateToken, getupsindividual);
router.get('/users/me', authenticateToken, getCurrentUser);

// Modified tracking details route with error handling
router.get('/tracking-details', authenticateToken, getTrackingDetails);

// Other file upload routes
router.post('/upload', authenticateToken, upload.fields([{ name: 'file1' }, { name: 'file2' }]), handleFileUpload);
router.post('/managementFile',authenticateToken, upload.single('file'), handleManagementFileUpload);
router.post('/crediantalsFile', authenticateToken, upload.single('file'), handleCrediantalsFileUpload);
router.post('/marketstructureFile', authenticateToken, upload.single('file'), (req, res, next) => {
  console.log('Uploaded file:', req.file);
  next();
}, handleMarketStructureFileUpload);

router.use((req, res) => {
  res.status(404).send('Not Found');
});

module.exports = router;