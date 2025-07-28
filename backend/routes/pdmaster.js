const express = require('express');
const router = express.Router();
const { createPDmaster, getAllPDmasters } = require('../controllers/PDmaster');

// Updated backend routes
router.post('/createPmaster', createPDmaster);  // For creating new entries
router.get('/getAllMasters', getAllPDmasters);  // For fetching all entries

module.exports = router;
