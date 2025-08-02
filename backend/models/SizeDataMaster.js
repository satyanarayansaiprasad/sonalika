const mongoose = require('mongoose');

const ValueItemSchema = new mongoose.Schema({
  value: { type: String, required: true },
  description: { type: String }
}, { _id: false });

const SizeDataMasterSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true
  },
  types: [{ 
    type: String, 
    required: true 
  }],
  values: {
    type: Map,
    of: [ValueItemSchema],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SizeDataMaster', SizeDataMasterSchema);