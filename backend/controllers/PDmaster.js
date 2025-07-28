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
    // Validate required fields
    const requiredFields = ['category', 'sizeType', 'sizeValue', 'description'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "Product image is required" 
      });
    }

    // Process image upload
    let imageUrl;
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const uploadResponse = await imagekit.upload({
        file: fileBuffer,
        fileName: req.file.originalname,
        folder: "/products",
      });

      imageUrl = imagekit.url({
        path: uploadResponse.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1280" }]
      });
    } catch (uploadError) {
      console.error('Image upload failed:', uploadError);
      throw new Error('Failed to upload product image');
    }

    // Create product
    const serialNumber = await getNextProductSerialNumber();
    const newProduct = await ProductMaster.create({
      serialNumber,
      category: req.body.category,
      sizeType: req.body.sizeType,
      sizeValue: req.body.sizeValue,
      description: req.body.description,
      image: imageUrl
    });

    // Clean up
    fs.unlinkSync(req.file.path);
    
    return res.status(201).json({ 
      success: true, 
      data: newProduct 
    });

  } catch (err) {
    console.error('Error creating Product Master:', err);
    
    // Clean up temp file if exists
    if (req.file?.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
      });
    }
    
    return res.status(500).json({
      success: false,
      message: err.message || 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
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