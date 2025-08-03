const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  createProductMaster,
  createDesignMaster,
  getAllProductMasters,
  getAllDesignMasters,
  createOrUpdateSizeDataMaster,
  getAllSizeDataMasters,
  getSizeDataByCategory
    
  } = require('../controllers/PDmaster');

const upload = require('../middleware/multer');

router.post('/createProductMaster', createProductMaster);
router.post('/createDesignMaster',upload.single('image'), createDesignMaster);
router.get('/getAllProductMasters', getAllProductMasters);
router.get('/getAllDesignMasters', getAllDesignMasters);

router.post('/size-data', createOrUpdateSizeDataMaster); // Create/update category
router.get('/size-data', getAllSizeDataMasters); // Get all categories
router.get('/size-data/:category', getSizeDataByCategory);
module.exports = router;