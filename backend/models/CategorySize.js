const mongoose = require('mongoose');

// One size type like "Length" or "Size"
const sizeValueSchema = new mongoose.Schema({
  value: { type: String, required: true },
  description: { type: String, required: true }
});

// One block for a size type + its values
const sizeTypeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Example: 'Length', 'Diameter'
  values: [sizeValueSchema]
});

// Whole category: 'NECKLACE', 'LADIES RING', etc.
const sizeCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  types: [sizeTypeSchema]
});

const CategorySize = mongoose.model('CategorySize', sizeCategorySchema);

module.exports = CategorySize;