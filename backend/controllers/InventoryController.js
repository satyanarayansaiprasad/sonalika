const Inventory = require('../models/Inventory');

// Get inventory
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.getInventory();
    res.status(200).json({ 
      success: true, 
      data: inventory 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update inventory
exports.updateInventory = async (req, res) => {
  try {
    let inventory = await Inventory.findOne();
    
    if (!inventory) {
      // Create new inventory if it doesn't exist
      inventory = new Inventory(req.body);
    } else {
      // Update existing inventory
      Object.assign(inventory, req.body);
      inventory.updatedAt = Date.now();
    }
    
    await inventory.save();
    
    res.status(200).json({ 
      success: true, 
      data: inventory,
      message: 'Inventory updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update specific metal quantity
exports.updateMetal = async (req, res) => {
  try {
    const { metal } = req.params; // gold, diamond, silver, platinum, other
    const { quantity, unit } = req.body;
    
    let inventory = await Inventory.findOne();
    
    if (!inventory) {
      inventory = new Inventory({});
    }
    
    if (inventory[metal]) {
      inventory[metal].quantity = quantity;
      if (unit) {
        inventory[metal].unit = unit;
      }
      inventory.updatedAt = Date.now();
      await inventory.save();
    } else {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid metal type: ${metal}` 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: inventory,
      message: `${metal} updated successfully` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

