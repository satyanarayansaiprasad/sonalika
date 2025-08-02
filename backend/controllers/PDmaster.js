const path = require('path');
const fs = require('fs');
const ProductMaster = require('../models/ProductMaster');
const DesignMaster = require('../models/DesignMaster');
const imagekit = require('../config/imagekit');
const SizeDataMaster = require('../models/SizeDataMaster');

// Generate next Product Serial Number


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
// Improved getNextProductSerialNumber function
const getNextProductSerialNumber = async (category) => {
  try {
    if (!category) {
      throw new Error('Category is required');
    }

    // Get the prefix from category (first letter of each word)
    const prefix = category.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    // Find the highest serial number with this prefix
    const lastProduct = await ProductMaster.findOne({ 
      serialNumber: new RegExp(`^${prefix}\\d+$`)
    }).sort({ serialNumber: -1 });

    let nextNumber = 1;
    if (lastProduct && lastProduct.serialNumber) {
      const lastNumber = parseInt(lastProduct.serialNumber.replace(prefix, '')) || 0;
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating serial number:', error);
    throw error;
  }
};

// Improved createProductMaster function
exports.createProductMaster = async (req, res) => {
  try {
    const { category, sizeType, sizeValue } = req.body;

    if (!category || !sizeType || !sizeValue) {
      return res.status(400).json({
        success: false,
        message: 'Category, sizeType and sizeValue are required'
      });
    }

    const serialNumber = await getNextProductSerialNumber(category);

    const newProduct = new ProductMaster({
      serialNumber,
      category,
      sizeType,
      sizeValue
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: 'Product Master created successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('Error creating Product Master:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create Product Master'
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



// Create or Update Size Data by Category
// exports.createOrUpdateSizeDataMaster = async (req, res) => {
//   try {
//     const { category, types, values } = req.body;

//     // Validate input
//     if (!category || !Array.isArray(types) || types.length === 0) {
//       return res.status(400).json({ error: 'Category and at least one type required' });
//     }

//     if (!values || Object.keys(values).length === 0) {
//       return res.status(400).json({ error: 'Values object cannot be empty' });
//     }

//     // Validate each type has values
//     for (const type of types) {
//       if (!Array.isArray(values[type])) {
//         return res.status(400).json({ error: `Values for ${type} must be an array` });
//       }
//     }

//     const formattedCategory = category.trim().toUpperCase();

//     // Update or create document
//     const existing = await SizeDataMaster.findOneAndUpdate(
//       { category: formattedCategory },
//       {
//         $set: {
//           types,
//           values
//         }
//       },
//       { new: true, upsert: true }
//     );

//     res.status(200).json({
//       message: existing ? 'Size data updated' : 'Size data created',
//       data: existing
//     });

//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ 
//       error: 'Server error',
//       details: err.message 
//     });
//   }
// };



// //get
// exports.getAllSizeData = async (req, res) => {
//   try {
//     const allData = await SizeDataMaster.find().sort({ category: 1 });

//     // Filter only valid entries (having at least one type and non-empty values)
//     const formattedData = allData
//       .filter(doc => doc.category && doc.types && doc.types.length > 0)
//       .map(doc => {
//         // Prepare clean value mapping
//         const values = {};
//         doc.types.forEach(type => {
//           const valArray = (doc.values && doc.values[type]) || [];
//           if (valArray.length > 0) {
//             values[type] = valArray;
//           }
//         });

//         return {
//           category: doc.category.toUpperCase(),
//           types: doc.types,
//           values: values,
//         };
//       })
//       .filter(item => Object.keys(item.values).length > 0); // remove empty ones

//     res.status(200).json({ data: formattedData });
//   } catch (err) {
//     console.error('Error in getAllSizeData:', err);
//     res.status(500).json({ error: 'Internal Server Error', details: err.message });
//   }
// };




