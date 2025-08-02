const mongoose = require('mongoose');

const ProductMasterSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  types: { type: String },
  values: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductMaster', ProductMasterSchema);
