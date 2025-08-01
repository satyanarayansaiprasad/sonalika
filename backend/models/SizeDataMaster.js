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
    type: Map,
    of: [ValueItemSchema], // Each key maps to an array of { value, description }
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SizeDataMaster', SizeDataMasterSchema);
