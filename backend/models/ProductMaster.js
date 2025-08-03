const mongoose = require('mongoose');

const ProductMasterSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  sizeType: { type: String, required: true },
  sizeValue: { type: String, required: true },  // or [String] if multiple
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductMaster', ProductMasterSchema);
