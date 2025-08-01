const path = require('path');
const fs = require('fs');
const ProductMaster = require('../models/ProductMaster');
const DesignMaster = require('../models/DesignMaster');
const imagekit = require('../config/imagekit');
const SizeDataMaster = require('../models/SizeDataMaster');

// Generate next Product Serial Number
// async function getNextProductSerialNumber() {
//   const last = await ProductMaster.findOne().sort({ serialNumber: -1 });
//   if (!last) return 'SJPROD0001';
//   const lastNumber = parseInt(last.serialNumber.replace('SJPROD', ''));
//   const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
//   return `SJPROD${nextNumber}`;
// }

// Generate next Style Number
// async function getNextStyleNumber() {
//   const last = await DesignMaster.findOne().sort({ styleNumber: -1 });
//   if (!last) return 'SJSTYLE0001';
//   const lastNumber = parseInt(last.styleNumber.replace('SJSTYLE', ''));
//   const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
//   return `SJSTYLE${nextNumber}`;
// }

// Create Product Master
exports.createProductMaster = async (req, res) => {
  try {
    console.log('Request body:', req.body);

    const { category, sizeType, sizeValue } = req.body;

    // Validate required fields
    if (!category || !sizeType || !sizeValue) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Generate Serial Number
    // const serialNumber = await getNextProductSerialNumber();

    // Create new product
    const newProduct = await ProductMaster.create({
      serialNumber,
      category,
      sizeType,
      sizeValue
    });

    res.status(201).json({ 
      success: true, 
      data: newProduct 
    });

  } catch (err) {
    console.error('Error creating Product Master:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};


// Other controller methods remain the same...

// Create Design Master
exports.createDesignMaster = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const {
      serialNumber,
      grossWt,
      netWt,
      diaWt,
      diaPcs,
      clarity,
      color
    } = req.body;

    const imageFile = req.file;

    let imageUrl = null;
    if (imageFile) {
      const uploadResponse = await imagekit.upload({
        file: imageFile.buffer,
        fileName: imageFile.originalname,
        folder: "/designs",
      });

      imageUrl = imagekit.url({
        path: uploadResponse.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" }
        ]
      });
    }

    // const styleNumber = await getNextStyleNumber();

    const newDesign = new DesignMaster({
      serialNumber,
      styleNumber,
      grossWt,
      netWt,
      diaWt,
      diaPcs,
      clarity,
      color,
      imageFile: imageUrl
    });

    await newDesign.save();
    res.status(201).json({ success: true, data: newDesign });

  } catch (err) {
    console.error('Error creating Design Master:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};


// Get all Product Masters
exports.getAllProductMasters = async (req, res) => {
  try {
    const allProducts = await ProductMaster.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: allProducts });
  } catch (err) {
    console.error('Error fetching Product Masters:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get all Design Masters
exports.getAllDesignMasters = async (req, res) => {
  try {
    const allDesigns = await DesignMaster.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: allDesigns });
  } catch (err) {
    console.error('Error fetching Design Masters:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};




//



// Create or Update SizeData by Category (Upsert)
exports.createOrUpdateSizeData = async (req, res) => {
  try {
    const { category, types, values } = req.body;

    if (!category || !types || !values) {
      return res.status(400).json({ message: 'Category, types, and values are required.' });
    }

    const updated = await SizeDataMaster.findOneAndUpdate(
      { category },
      { category, types, values },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Size data saved successfully', data: updated });
  } catch (error) {
    console.error('Error saving size data:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all size data
exports.getAllSizeData = async (req, res) => {
  try {
    const data = await SizeDataMaster.find();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching size data:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get size data by category
exports.getSizeDataByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const data = await SizeDataMaster.findOne({ category });

    if (!data) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching category size data:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update only values/types for a category
exports.updateSizeData = async (req, res) => {
  try {
    const { category } = req.params;
    const { types, values } = req.body;

    const updated = await SizeDataMaster.findOneAndUpdate(
      { category },
      { ...(types && { types }), ...(values && { values }) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Size data updated', data: updated });
  } catch (error) {
    console.error('Error updating size data:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};





