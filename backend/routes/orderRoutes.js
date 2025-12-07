const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Orders route is working!',
    timestamp: new Date().toISOString()
  });
});

// Get all orders
router.get('/all', OrderController.getAllOrders);

// Get orders by status
router.get('/status/:status', OrderController.getOrdersByStatus);

// Get accepted orders
router.get('/accepted', OrderController.getAcceptedOrders);

// Get rejected orders
router.get('/rejected', OrderController.getRejectedOrders);

// Get completed orders
router.get('/completed', OrderController.getCompletedOrders);

// Create a new order
router.post('/create', OrderController.createOrder);

// Accept an order
router.put('/accept/:orderId', OrderController.acceptOrder);

// Reject an order
router.put('/reject/:orderId', OrderController.rejectOrder);

// Update an order
router.put('/update/:orderId', OrderController.updateOrder);

// Delete an order
router.delete('/delete/:orderId', OrderController.deleteOrder);

// Sync orders from Client orders to Order collection
router.post('/sync-from-clients', OrderController.syncOrdersFromClients);

// Move order to next department
router.put('/move-to-next/:orderId', OrderController.moveToNextDepartment);

// Mark order as pending in current department
router.put('/mark-pending/:orderId', OrderController.markOrderPending);

// Resolve pending order
router.put('/resolve-pending/:orderId', OrderController.resolvePending);

module.exports = router;

