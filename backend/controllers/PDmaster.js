const path = require('path');
const PDmaster = require('../models/PDmaster');

// Generate next Product Serial Number
async function getNextProductSerialNumber() {
  const last = await PDmaster.findOne().sort({ 'productMaster.serialNumber': -1 });
  if (!last) return 'SJPROD0001';

  const lastNumber = parseInt(last.productMaster.serialNumber.replace('SJPROD', ''));
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `SJPROD${nextNumber}`;
}

// Generate next Style Number
async function getNextStyleNumber() {
  const last = await PDmaster.findOne().sort({ 'designMaster.styleNumber': -1 });
  if (!last) return 'SJSTYLE0001';

  const lastNumber = parseInt(last.designMaster.styleNumber.replace('SJSTYLE', ''));
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `SJSTYLE${nextNumber}`;
}

// Create PDmaster (Product + Design)
exports.createPDmaster = async (req, res) => {
  try {
    const {
      category,
      sizeType,
      sizeValue,
      description,
      grossWt,
      netWt,
      diaWt,
      diaPcs,
      clarity,
      color
    } = req.body;

    const serialNumber = await getNextProductSerialNumber();
    const styleNumber = await getNextStyleNumber();

    // Get uploaded files from multer
    const productImage = req.files?.productImage?.[0];
    const designImage = req.files?.designImage?.[0];

    const newEntry = new PDmaster({
      productMaster: {
        serialNumber,
        category,
        sizeType,
        sizeValue,
        description,
        image: {
          url: productImage ? `/uploads/${productImage.filename}` : '',
          alt: `Product ${serialNumber}`
        }
      },
      designMaster: {
        serialNumber,
        styleNumber,
        grossWt,
        netWt,
        diaWt,
        diaPcs,
        clarity,
        color,
        image: {
          url: designImage ? `/uploads/${designImage.filename}` : '',
          alt: `Design ${styleNumber}`
        }
      }
    });

    await newEntry.save();
    res.status(201).json({ success: true, data: newEntry });
  } catch (err) {
    console.error('Error creating PDmaster:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error',
      error: err.message 
    });
  }
};

// Get all PDmasters
exports.getAllPDmasters = async (req, res) => {
  try {
    const allData = await PDmaster.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: allData });
  } catch (err) {
    console.error('Error fetching PDmasters:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};