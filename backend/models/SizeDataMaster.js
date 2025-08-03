const mongoose = require('mongoose');

const ValueSchema = new mongoose.Schema({
  value: String,
  description: String,
});

const SizeDataMasterSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  types: {
    type: [String],
    required: true
  },
  values: {
    type: Map,
    of: [ValueSchema],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SizeDataMaster', SizeDataMasterSchema);
