const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController');

// Get inventory
router.get('/', InventoryController.getInventory);

// Update entire inventory
router.put('/update', InventoryController.updateInventory);

// Update specific metal
router.put('/update/:metal', InventoryController.updateMetal);

module.exports = router;

