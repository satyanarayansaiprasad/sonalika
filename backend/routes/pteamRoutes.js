const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  createProductMaster,
  createDesignMaster,
  getAllProductMasters,
  getAllDesignMasters
} = require('../controllers/PDmaster');

const upload = require('../middleware/multer');

router.post('/createProductMaster',upload.single('image'), createProductMaster);
router.post('/createDesignMaster', createDesignMaster);
router.get('/getAllProductMasters', getAllProductMasters);
router.get('/getAllDesignMasters', getAllDesignMasters);

module.exports = router;