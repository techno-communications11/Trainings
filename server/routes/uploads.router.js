  const express = require('express');
  const upload = require('../multer/multer'); // Import multer
  const { handleFileUpload } = require('../components/handleFileUpload.js');
  const { handleManagementFileUpload } = require('../components/management.js');
  const { handleCrediantalsFileUpload } = require('../components/crediantals.js');
  const { handleMarketStructureFileUpload } = require('../components/marketStructure.js');
  const { getTrackingDetails } =require('../components/getTrackingDetails.js');
  const {Login}=require('../components/Login.js')
  const {Register}=require('../components/Register.js')

 const updatepassword = require('../components/updatepassword')

  const router = express.Router();
  router.post('/login', Login);
  router.post('/register', Register);
  router.put('/update-password',updatepassword);
  // Define routes for file upload
  router.get('/tracking-details', getTrackingDetails);
  router.post('/upload', upload.fields([{ name: 'file1' }, { name: 'file2' }]), handleFileUpload);
  router.post('/managementFile', upload.single('file'), handleManagementFileUpload);
  router.post('/crediantalsFile', upload.single('file'), handleCrediantalsFileUpload);
  router.post('/marketstructureFile', upload.single('file'), (req, res, next) => {
    console.log('Uploaded file:', req.file); // Log file details
    next();
  }, handleMarketStructureFileUpload); // Call handler for market structure upload

  module.exports = router;
