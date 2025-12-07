const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  createProductMaster,
  createDesignMaster,
  getAllProductMasters,
  getAllDesignMasters,
  getStyleNumbers,
  addCategorySize,
  getAllCategorySizes,
  getCategorySize,
  updateCategorySize,
  deleteCategorySize,
  getDesignsByDepartment,
  updateDesignDepartment
} = require('../controllers/PDmaster');

const upload = require('../middleware/multer');

router.post('/createProductMaster', createProductMaster);
router.post('/createDesignMaster', upload.single('image'),createDesignMaster);
router.get('/getAllProductMasters', getAllProductMasters);
router.get('/getAllDesignMasters', getAllDesignMasters);
router.get('/getStyleNumbers', getStyleNumbers);
router.get('/getDesignsByDepartment', getDesignsByDepartment);
router.put('/updateDesignDepartment/:designId', updateDesignDepartment);


router.post('/category-size', addCategorySize);
router.get('/category-size', getAllCategorySizes);
router.get('/category-size/:name', getCategorySize);
router.put('/category-size/:name', updateCategorySize);
router.delete('/category-size/:name', deleteCategorySize);
module.exports = router;