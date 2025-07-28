const express = require('express');
const router = express.Router();
const { createPDmaster, getAllPDmasters } = require('../controllers/PDmaster');

router.post('/createPmaster', createPDmaster);
router.get('/getPmaster', getAllPDmasters);

module.exports = router;
