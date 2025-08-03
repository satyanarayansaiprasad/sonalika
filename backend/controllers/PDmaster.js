const path = require('path');
const fs = require('fs');
const ProductMaster = require('../models/ProductMaster');
const DesignMaster = require('../models/DesignMaster');
const imagekit = require('../config/imagekit');

// Generate next Product Serial Number
async function getNextProductSerialNumber() {
  const last = await ProductMaster.findOne().sort({ serialNumber: -1 });
  if (!last) return 'SJPROD0001';
  const lastNumber = parseInt(last.serialNumber.replace('SJPROD', ''));
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `SJPROD${nextNumber}`;
}

// Generate next Style Number
async function getNextStyleNumber() {
  const last = await DesignMaster.findOne().sort({ styleNumber: -1 });
  if (!last) return 'SJSTYLE0001';
  const lastNumber = parseInt(last.styleNumber.replace('SJSTYLE', ''));
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `SJSTYLE${nextNumber}`;
}

// Create Product Master (simplified without image and description)
exports.createProductMaster = async (req, res) => {
  try {
    const { category, sizeType, sizeValue } = req.body;

    // Validate required fields
    if (!category || !sizeType || !sizeValue) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Create new product
    const serialNumber = await getNextProductSerialNumber();
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

// Create Design Master with image upload
exports.createDesignMaster = async (req, res) => {
  try {
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

    // Validate required fields
    if (!serialNumber || !grossWt || !netWt || !diaWt || !diaPcs || !clarity || !color) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    if (!imageFile) {
      return res.status(400).json({ 
        success: false,
        message: "Design image is required" 
      });
    }

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: imageFile.buffer,
      fileName: imageFile.originalname,
      folder: "/designs",
    });

    // Generate optimized URL
    const imageUrl = imagekit.url({
      path: uploadResponse.filePath,
      transformation: [
        { quality: "auto" }, 
        { format: "webp" }, 
        { width: "1280" }
      ]
    });

    const styleNumber = await getNextStyleNumber();

    const newDesign = await DesignMaster.create({
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

    res.status(201).json({ 
      success: true, 
      data: newDesign 
    });

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





// Add new category with size types and values
exports.addCategorySize = async (req, res) => {
  try {
    const { name, types } = req.body;

    // Check if the category already exists
    const existingCategory = await CategorySize.findOne({ name: name.toUpperCase() });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = new CategorySize({
      name: name.toUpperCase(),
      types
    });

    await newCategory.save();
    return res.status(201).json({ message: 'Category added successfully', data: newCategory });
  } catch (error) {
    console.error('Error adding category size:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


