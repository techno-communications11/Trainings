const express = require('express');
const upload = require('../multer/multer');
const { handleFileUpload } = require('../components/handleFileUpload.js');
const { handleManagementFileUpload } = require('../components/management.js');
const { handleCrediantalsFileUpload } = require('../components/crediantals.js');
const { handleMarketStructureFileUpload } = require('../components/marketStructure.js');
const { getTrackingDetails } = require('../components/getTrackingDetails.js');
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
const logout = require('../components/logout.js');
const locationlog = require('../controllers/locationlog.js');

const router = express.Router();

router.post('/login', Login);
router.post('/log-location', authenticateToken, locationlog);
router.post('/register', Register);
router.put('/update-password', authenticateToken, updatepassword);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', authenticateToken, logout);

router.post('/upload-fedex', 
  authenticateToken, 
  upload.single('file'), 
  async (req, res, next) => {
    try {
      await processUpload(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/upload-ups', 
  authenticateToken, 
  upload.single('file'), 
  async (req, res, next) => {
    try {
      await upsprocessUpload(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/getalltrackingdata', authenticateToken, getAllTrackingData);
router.post('/gettrackindividual', authenticateToken, gettrackindividual);
router.post('/getupsindividual', authenticateToken, getupsindividual);
router.get('/tracking-details', authenticateToken, getTrackingDetails);

router.post('/upload', 
  upload.fields([{ name: 'file1' }, { name: 'file2' }]), 
  async (req, res, next) => {
    try {
      await handleFileUpload(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/managementFile', upload.single('file'), handleManagementFileUpload);
router.post('/crediantalsFile', upload.single('file'), handleCrediantalsFileUpload);
router.post('/marketstructureFile', 
  upload.single('file'), 
  (req, res, next) => {
    console.log('Uploaded file:', req.file);
    next();
  }, 
  handleMarketStructureFileUpload
);

router.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

 

router.use((err, req, res, next) => {
  console.error('Route error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

module.exports = router;