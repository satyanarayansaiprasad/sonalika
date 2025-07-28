const mongoose = require('mongoose');

const productionmaster = new mongoose.Schema({
 


  productMaster: {
    serialNumber: { type: String, unique: true },
    category: String,
    sizeType: String,
    sizeValue: String,
    description: String,
      image: String,
   
  },
  designMaster: {
    serialNumber: String, // Links to product
    styleNumber: { type: String, unique: true },
    grossWt: Number,
    netWt: Number,
    diaWt: Number,
    diaPcs: Number,
    clarity: { type: String, default: 'vvs' },
    color: { type: String, default: 'e-f' },
    
  }
}, { timestamps: true });


const PDmaster = mongoose.model('PDmaster', productionmaster);
module.exports = PDmaster;
