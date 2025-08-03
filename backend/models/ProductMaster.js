const mongoose = require('mongoose');

const ProductMasterSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  sizeType: { type: String },
  sizeValue: { type: String },
  description: { type: String },
  imageFile: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductMaster', ProductMasterSchema);