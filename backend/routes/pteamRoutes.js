const express = require('express');
const {
  createProductMaster,
  createDesignMaster,
  getAllProductMasters,
  getAllDesignMasters
} = require('../controllers/PDmaster');

const router = express.Router();

router.post('/createProductMaster', createProductMaster);
router.post('/createDesignMaster', createDesignMaster);
router.get('/getAllProductMasters', getAllProductMasters);
router.get('/getAllDesignMasters', getAllDesignMasters);

module.exports = router;