const path = require('path');
const fs = require('fs');
const ProductMaster = require('../models/ProductMaster');
const DesignMaster = require('../models/DesignMaster');
const imagekit = require('../config/imagekit');
const SizeDataMaster = require('../models/SizeDataMaster');

// Generate next Product Serial Number
async function getNextProductSerialNumber(category) {
  const formattedCategory = category.trim().toUpperCase();

  const regex = new RegExp(`^SJ_${formattedCategory}(\\d+)$`);

  const last = await ProductMaster
    .findOne({ serialNumber: { $regex: regex } })
    .sort({ serialNumber: -1 });

  if (!last) return `SJ_${formattedCategory}01`;

  const lastNumber = parseInt(last.serialNumber.replace(`SJ_${formattedCategory}`, ''));
  const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
  
  return `SJ_${formattedCategory}${nextNumber}`;
}

// Generate next Style Number
async function getNextStyleNumber(category) {
  const formattedCategory = category.trim().toUpperCase();

  const regex = new RegExp(`^STYLE_${formattedCategory}(\\d+)$`);

  const last = await DesignMaster
    .findOne({ styleNumber: { $regex: regex } })
    .sort({ styleNumber: -1 });

  if (!last) return `STYLE_${formattedCategory}01`;

  const lastNumber = parseInt(last.styleNumber.replace(`STYLE_${formattedCategory}`, ''));
  const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
  
  return `STYLE_${formattedCategory}${nextNumber}`;
}


// Create Product Master
exports.createProductMaster = async (req, res) => {
  try {
    console.log('Request body:', req.body);

    const { category, types, values } = req.body;

    // Validate required fields
    if (!category || !types || !values) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Generate Serial Number
    const serialNumber = await getNextProductSerialNumber();

    // Create new product
    const newProduct = await ProductMaster.create({
      serialNumber,
      category,
      types,
values    });

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

    const styleNumber = await getNextStyleNumber();

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





// Create or Update size data for a category
exports.createOrUpdateSizeDataMaster = async (req, res) => {
  try {
    const { category, types, values } = req.body;

    if (!category || !Array.isArray(types) || typeof values !== 'object') {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    const formattedCategory = category.trim().toUpperCase();

    // Check if data already exists
    let existing = await SizeDataMaster.findOne({ category: formattedCategory });

    if (existing) {
      // Update
      existing.types = types;
      existing.values = values;
      await existing.save();
      return res.status(200).json({ message: 'Size data updated successfully', data: existing });
    } else {
      // Create
      const newSizeData = new SizeDataMaster({
        category: formattedCategory,
        types,
        values
      });
      await newSizeData.save();
      return res.status(201).json({ message: 'Size data created successfully', data: newSizeData });
    }
  } catch (error) {
    console.error('Error in size data controller:', error);
    res.status(500).json({ error: 'Server error' });
  }
};



//get
exports.getAllSizeDataMasters = async (req, res) => {
  try {
    const data = await SizeDataMaster.find().sort({ category: 1 });
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching size data:', error);
    res.status(500).json({ error: 'Server error' });
  }
};




exports.getSizeDataByCategory = async (req, res) => {
  try {
    const category = req.params.category.toUpperCase();
    const data = await SizeDataMaster.findOne({ category });
    if (!data) return res.status(404).json({ error: 'Category not found' });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
