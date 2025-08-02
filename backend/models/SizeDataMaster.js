const mongoose = require('mongoose');

const ValueItemSchema = new mongoose.Schema({
  value: { type: String, required: true },
  description: { type: String }
}, { _id: false });

const TypeValuesMapSchema = new mongoose.Schema({}, { strict: false, _id: false });

const SizeDataMasterSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  types: [{ type: String, required: true }],
  values: {
    type: mongoose.Schema.Types.Mixed, // Changed from Map to Mixed
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SizeDataMaster', SizeDataMasterSchema);
