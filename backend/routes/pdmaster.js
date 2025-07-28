const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer'); // Import multer config
const { createPDmaster, getAllPDmasters } = require('../controllers/pdmasterController');

// Use multer middleware for file uploads
router.post('/createPmaster', upload.fields([
  { name: 'productImage', maxCount: 1 },
  { name: 'designImage', maxCount: 1 }
]), createPDmaster);

router.get('/getAllMasters', getAllPDmasters);

module.exports = router;