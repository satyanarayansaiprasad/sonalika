const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  createProductMaster,
  createDesignMaster,
  getAllProductMasters,
  getAllDesignMasters,
  createOrUpdateSizeDataMaster,
  getAllSizeData,
    
  } = require('../controllers/PDmaster');

const upload = require('../middleware/multer');

router.post('/createProductMaster', createProductMaster);
router.post('/createDesignMaster',upload.single('image'), createDesignMaster);
router.get('/getAllProductMasters', getAllProductMasters);
router.get('/getAllDesignMasters', getAllDesignMasters);


router.post('/createSizeDataMaster', createOrUpdateSizeDataMaster);

router.get('/getAllSizeData', getAllSizeData); // get all
// router.get('/size-data/:category',getSizeDataByCategory); // get one
// router.put('/size-data/:category', updateSizeData); // update existing

module.exports = router;