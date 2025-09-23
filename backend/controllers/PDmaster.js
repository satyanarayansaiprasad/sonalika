const path = require('path');
const fs = require('fs');
const ProductMaster = require('../models/ProductMaster');
const DesignMaster = require('../models/DesignMaster');
const imagekit = require('../config/imagekit');
const CategorySize = require('../models/CategorySize');

// Generate next Product Serial Number
async function getNextProductSerialNumber() {
  const last = await ProductMaster.findOne().sort({ serialNumber: -1 });
  if (!last) return 'SJPROD0001';
  const lastNumber = parseInt(last.serialNumber.replace('SJPROD', ''));
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `SJPROD${nextNumber}`;
}

// Generate next Style Number based on category
async function getNextStyleNumber(category) {
  // Category mapping
  const categoryMap = {
    'NECKLACE': 'NK',
    'RING': 'RG', 
    'EARRING': 'ER',
    'EARRINGS': 'ER',
    'BRACELET': 'BR',
    'PENDANT': 'PD',
    'CHAIN': 'CH',
    'BANGLE': 'BG'
  };
  
  const prefix = categoryMap[category?.toUpperCase()] || 'SJ';
  
  // Find the last design with the same category prefix
  const last = await DesignMaster.findOne({
    styleNumber: { $regex: `^${prefix}` }
  }).sort({ styleNumber: -1 });
  
  if (!last) {
    return `${prefix}001`;
  }
  
  // Extract the number part and increment
  const lastNumber = parseInt(last.styleNumber.replace(prefix, ''));
  const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
  return `${prefix}${nextNumber}`;
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
      color,
      category
    } = req.body;

    const imageFile = req.file;

    // Validate required fields
    if (!serialNumber || !grossWt || !netWt || !diaWt || !diaPcs || !clarity || !color || !category) {
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

    const styleNumber = await getNextStyleNumber(category);

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

// Get all style numbers for dropdown
exports.getStyleNumbers = async (req, res) => {
  try {
    const designs = await DesignMaster.find({}, 'styleNumber serialNumber grossWt netWt diaWt diaPcs clarity color imageFile').sort({ styleNumber: 1 });
    res.status(200).json({ success: true, data: designs });
  } catch (err) {
    console.error('Error fetching Style Numbers:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};






// POST /api/category-size
exports.addCategorySize = async (req, res) => {
  try {
    const { name, types } = req.body;

    if (!name || !Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ message: "Category name and types are required" });
    }

    // Check for existing category
    const existing = await CategorySize.findOne({ name: name.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new CategorySize({
      name: name.toUpperCase(),
      types
    });

    await category.save();
    res.status(201).json({ message: "Category added successfully", data: category });
  } catch (error) {
    console.error("Add category error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};






// Get all size categories
exports.getAllCategorySizes = async (req, res) => {
  try {
    const categories = await CategorySize.find().sort({ name: 1 });
    return res.status(200).json({ data: categories });
  } catch (error) {
    console.error('Error fetching category sizes:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get single category by name
exports.getCategorySize = async (req, res) => {
  try {
    const { name } = req.params;
    const category = await CategorySize.findOne({ name: name.toUpperCase() });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    return res.status(200).json({ data: category });
  } catch (error) {
    console.error('Error fetching category size:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update a category
exports.updateCategorySize = async (req, res) => {
  try {
    const { name } = req.params;
    const { types } = req.body;

    const updatedCategory = await CategorySize.findOneAndUpdate(
      { name: name.toUpperCase() },
      { $set: { types } },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json({ 
      message: 'Category updated successfully', 
      data: updatedCategory 
    });
  } catch (error) {
    console.error('Error updating category size:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete a category
exports.deleteCategorySize = async (req, res) => {
  try {
    const { name } = req.params;
    const deletedCategory = await CategorySize.findOneAndDelete({ 
      name: name.toUpperCase() 
    });

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json({ 
      message: 'Category deleted successfully', 
      data: deletedCategory 
    });
  } catch (error) {
    console.error('Error deleting category size:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};