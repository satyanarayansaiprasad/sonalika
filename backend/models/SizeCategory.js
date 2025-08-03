const mongoose = require('mongoose');

const sizeValueSchema = new mongoose.Schema({
  value: { type: String, required: true },
  description: { type: String, required: true }
});

const sizeTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  values: [sizeValueSchema]
});

const sizeCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  types: [sizeTypeSchema]
});
 const SizeCategory =  mongoose.model('SizeCategory', sizeCategorySchema);

module.exports = SizeCategory;
