const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Get all orders
router.get('/all', OrderController.getAllOrders);

// Get orders by status
router.get('/status/:status', OrderController.getOrdersByStatus);

// Get accepted orders
router.get('/accepted', OrderController.getAcceptedOrders);

// Get rejected orders
router.get('/rejected', OrderController.getRejectedOrders);

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

module.exports = router;

