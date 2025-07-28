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

// Create PDmaster (Product + Design) without image handling
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
      clarity = 'vvs', // Default values
      color = 'e-f'    // Default values
    } = req.body;

    const serialNumber = await getNextProductSerialNumber();
    const styleNumber = await getNextStyleNumber();

    const newEntry = new PDmaster({
      productMaster: {
        serialNumber,
        category,
        sizeType,
        sizeValue,
        description,
        image: {
          url: '',
          alt: `Product ${serialNumber}`
        }
      },
      designMaster: {
        serialNumber,
        styleNumber,
        grossWt: grossWt || 0,
        netWt: netWt || 0,
        diaWt: diaWt || 0,
        diaPcs: diaPcs || 0,
        clarity,
        color,
        image: {
          url: '',
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