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

// Create Product Master
exports.createProductMaster = async (req, res) => {
  try {
    const { category, sizeType, sizeValue, description } = req.body;
    const imageFile = req.file;

    // Validate required fields
    if (!category || !sizeType || !sizeValue || !description) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    if (!imageFile) {
      return res.status(400).json({ 
        success: false,
        message: "Image is required" 
      });
    }

    // Upload to ImageKit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/products",
    });

    // Generate optimized URL
    const imageUrl = imagekit.url({
      path: uploadResponse.filePath,
      transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1280" }]
    });

    // Create new product
    const serialNumber = await getNextProductSerialNumber();
    const newProduct = await ProductMaster.create({
      serialNumber,
      category,
      sizeType,
      sizeValue,
      description,
      image: imageUrl
    });

    // Clean up temporary file
    fs.unlinkSync(imageFile.path);
    
    res.status(201).json({ 
      success: true, 
      data: newProduct 
    });

  } catch (err) {
    console.error('Error creating Product Master:', err);
    
    // Clean up temp file if error occurred
    if (req.file) {
      fs.unlinkSync(req.file.path).catch(console.error);
    }
    
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
    const { 
      serialNumber,
      grossWt, 
      netWt, 
      diaWt, 
      diaPcs, 
      clarity, 
      color 
    } = req.body;

    const styleNumber = await getNextStyleNumber();

    const newDesign = new DesignMaster({
      serialNumber,
      styleNumber,
      grossWt,
      netWt,
      diaWt,
      diaPcs,
      clarity,
      color
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