const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  gold: {
    quantity: { type: Number, required: true, default: 1500.50 },
    unit: { type: String, default: 'grams' }
  },
  diamond: {
    quantity: { type: Number, required: true, default: 250.75 },
    unit: { type: String, default: 'carats' }
  },
  silver: {
    quantity: { type: Number, required: true, default: 5000.00 },
    unit: { type: String, default: 'grams' }
  },
  platinum: {
    quantity: { type: Number, required: true, default: 800.25 },
    unit: { type: String, default: 'grams' }
  },
  other: {
    quantity: { type: Number, required: true, default: 100.00 },
    unit: { type: String, default: 'pieces' }
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  // Only one inventory document should exist
  collection: 'inventory'
});

// Ensure only one inventory document exists
inventorySchema.statics.getInventory = async function() {
  let inventory = await this.findOne();
  if (!inventory) {
    inventory = await this.create({});
  }
  return inventory;
};

module.exports = mongoose.model("Inventory", inventorySchema);

