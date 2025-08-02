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
async function getNextStyleNumber(productSerialNumber) {
  try {
    // Find the product to get its category
    const product = await ProductMaster.findOne({ serialNumber: productSerialNumber });
    if (!product) {
      throw new Error('Product not found');
    }

    const formattedCategory = product.category.trim().toUpperCase();

    const regex = new RegExp(`^STYLE_${formattedCategory}(\\d+)$`);

    const last = await DesignMaster
      .findOne({ styleNumber: { $regex: regex } })
      .sort({ styleNumber: -1 });

    if (!last) return `STYLE_${formattedCategory}01`;

    const lastNumber = parseInt(last.styleNumber.replace(`STYLE_${formattedCategory}`, ''));
    const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
    
    return `STYLE_${formattedCategory}${nextNumber}`;
  } catch (error) {
    console.error('Error generating style number:', error);
    throw error;
  }
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
        message: "All fields (category, types, values) are required" 
      });
    }

    // Generate Serial Number with category parameter
    const serialNumber = await getNextProductSerialNumber(category);

    // Create new product
    const newProduct = await ProductMaster.create({
      serialNumber,
      category: category.trim().toUpperCase(),
      types,
      values
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

    // Validate required fields
    if (!serialNumber || !grossWt || !netWt || !diaWt || !diaPcs || !clarity || !color) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const imageFile = req.file;

    let imageUrl = null;
    if (imageFile) {
      try {
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
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadError.message
        });
      }
    }

    // Generate style number based on the product's category
    const styleNumber = await getNextStyleNumber(serialNumber);

    const newDesign = new DesignMaster({
      serialNumber,
      styleNumber,
      grossWt: parseFloat(grossWt),
      netWt: parseFloat(netWt),
      diaWt: parseFloat(diaWt),
      diaPcs: parseInt(diaPcs),
      clarity: clarity.toLowerCase(),
      color: color.toLowerCase(),
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
    res.status(500).json({ 
      success: false, 
      message: 'Server Error',
      error: err.message 
    });
  }
};

// Get all Design Masters
exports.getAllDesignMasters = async (req, res) => {
  try {
    const allDesigns = await DesignMaster.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: allDesigns });
  } catch (err) {
    console.error('Error fetching Design Masters:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error',
      error: err.message 
    });
  }
};

// Create or Update Size Data by Category
exports.createSizeDataMaster = async (req, res) => {
  try {
    const { category, types, values } = req.body;

    console.log('Received data:', { category, types, values });

    // Validate input
    if (!category || !Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Category and at least one type are required' 
      });
    }

    if (!values || Object.keys(values).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Values object cannot be empty' 
      });
    }

    // Validate each type has values
    for (const type of types) {
      if (!Array.isArray(values[type]) || values[type].length === 0) {
        return res.status(400).json({ 
          success: false,
          message: `Values for ${type} must be a non-empty array` 
        });
      }
      
      // Validate each value item has required structure
      for (const item of values[type]) {
        if (!item.value || typeof item.value !== 'string') {
          return res.status(400).json({ 
            success: false,
            message: `Each value item must have a 'value' property for ${type}` 
          });
        }
      }
    }

    const formattedCategory = category.trim().toUpperCase();

    // Convert values object to Map format for MongoDB
    const valuesMap = new Map();
    for (const [key, valueArray] of Object.entries(values)) {
      valuesMap.set(key, valueArray);
    }

    // Update or create document
    const sizeData = await SizeDataMaster.findOneAndUpdate(
      { category: formattedCategory },
      {
        $set: {
          category: formattedCategory,
          types: types,
          values: valuesMap
        }
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Size data created/updated successfully',
      data: sizeData
    });

  } catch (err) {
    console.error('Error in createSizeDataMaster:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

// Get all Size Data
exports.getAllSizeData = async (req, res) => {
  try {
    const allData = await SizeDataMaster.find().sort({ category: 1 });

    console.log('Raw data from DB:', allData);

    // Format data for frontend consumption
    const formattedData = allData
      .filter(doc => doc.category && doc.types && doc.types.length > 0)
      .map(doc => {
        const values = {};
        
        // Handle both Map and Object formats
        if (doc.values instanceof Map) {
          // Convert Map to Object
          doc.types.forEach(type => {
            const valArray = doc.values.get(type) || [];
            if (valArray.length > 0) {
              values[type] = valArray;
            }
          });
        } else if (typeof doc.values === 'object') {
          // Handle regular object
          doc.types.forEach(type => {
            const valArray = doc.values[type] || [];
            if (valArray.length > 0) {
              values[type] = valArray;
            }
          });
        }

        return {
          category: doc.category,
          types: doc.types,
          values: values,
        };
      })
      .filter(item => Object.keys(item.values).length > 0);

    console.log('Formatted data:', formattedData);

    res.status(200).json({ 
      success: true,
      data: formattedData 
    });

  } catch (err) {
    console.error('Error in getAllSizeData:', err);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error', 
      error: err.message 
    });
  }
};

// Get Size Data by Category
exports.getSizeDataByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category parameter is required'
      });
    }

    const formattedCategory = category.trim().toUpperCase();
    const sizeData = await SizeDataMaster.findOne({ category: formattedCategory });

    if (!sizeData) {
      return res.status(404).json({
        success: false,
        message: 'Size data not found for this category'
      });
    }

    // Format the response
    const values = {};
    if (sizeData.values instanceof Map) {
      sizeData.types.forEach(type => {
        const valArray = sizeData.values.get(type) || [];
        if (valArray.length > 0) {
          values[type] = valArray;
        }
      });
    } else if (typeof sizeData.values === 'object') {
      sizeData.types.forEach(type => {
        const valArray = sizeData.values[type] || [];
        if (valArray.length > 0) {
          values[type] = valArray;
        }
      });
    }

    const formattedData = {
      category: sizeData.category,
      types: sizeData.types,
      values: values
    };

    res.status(200).json({
      success: true,
      data: formattedData
    });

  } catch (err) {
    console.error('Error in getSizeDataByCategory:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};