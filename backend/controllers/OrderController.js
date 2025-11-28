const Order = require('../models/Order');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log('Found orders:', orders.length);
    
    // Convert Mongoose documents to plain objects
    const ordersArray = orders.map(order => order.toObject ? order.toObject() : order);
    
    console.log('Orders array length:', ordersArray.length);
    if (ordersArray.length > 0) {
      console.log('First order sample:', JSON.stringify(ordersArray[0], null, 2));
    }
    
    const response = {
      success: true,
      data: ordersArray,
      count: ordersArray.length
    };
    
    console.log('Sending response with structure:', {
      success: response.success,
      dataLength: response.data.length,
      count: response.count
    });
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack
    });
  }
};

// Get orders by status
exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await Order.find({ status }).sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get accepted orders
exports.getAcceptedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'accepted' }).sort({ acceptedDate: -1 });
    res.status(200).json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get rejected orders
exports.getRejectedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'rejected' }).sort({ rejectedDate: -1 });
    res.status(200).json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ 
      success: true, 
      data: order,
      message: 'Order created successfully' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Accept an order
exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Order is not in pending status' 
      });
    }

    order.status = 'accepted';
    order.acceptedDate = new Date();
    await order.save();

    res.status(200).json({ 
      success: true, 
      data: order,
      message: 'Order accepted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Reject an order
exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rejectionReason } = req.body;
    
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Order is not in pending status' 
      });
    }

    order.status = 'rejected';
    order.rejectionReason = rejectionReason || 'Not enough materials available at accounts';
    order.rejectedDate = new Date();
    await order.save();

    res.status(200).json({ 
      success: true, 
      data: order,
      message: 'Order rejected successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOneAndUpdate(
      { orderId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: order,
      message: 'Order updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOneAndDelete({ orderId });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Order deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Sync orders from Client orders to Order collection
exports.syncOrdersFromClients = async (req, res) => {
  try {
    const Clienttss = require('../models/Clienttss');
    const clients = await Clienttss.find();
    
    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const client of clients) {
      if (!client.orders || client.orders.size === 0) continue;

      for (const [orderId, orderData] of client.orders.entries()) {
        try {
          // Check if order already exists in Order collection
          const existingOrder = await Order.findOne({ orderId });
          if (existingOrder) {
            skippedCount++;
            continue;
          }

          // Calculate material requirements
          let totalGold = 0;
          let totalDiamond = 0;
          let totalSilver = 0;
          let totalPlatinum = 0;

          if (orderData.orderItems && Array.isArray(orderData.orderItems)) {
            orderData.orderItems.forEach(item => {
              totalGold += (parseFloat(item.netWeight) || 0) * (item.quantity || 1);
              totalDiamond += (parseFloat(item.diaWeight) || 0) * (item.quantity || 1);
            });
          }

          // Format order date
          const orderDate = orderData.orderDate instanceof Date
            ? orderData.orderDate.toISOString().split('T')[0]
            : (orderData.orderDate || new Date().toISOString().split('T')[0]);

          // Create order in Order collection
          const newOrder = new Order({
            orderId: orderId,
            orderDate: orderDate,
            clientName: client.name || 'Unknown Client',
            description: orderData.orderDescription || `Order from ${client.name}`,
            gold: {
              quantity: totalGold || 0,
              unit: 'grams'
            },
            diamond: {
              quantity: totalDiamond || 0,
              unit: 'carats'
            },
            silver: {
              quantity: totalSilver || 0,
              unit: 'grams'
            },
            platinum: {
              quantity: totalPlatinum || 0,
              unit: 'grams'
            },
            status: orderData.status === 'ongoing' ? 'pending' : 'pending'
          });

          await newOrder.save();
          syncedCount++;
        } catch (error) {
          console.error(`Error syncing order ${orderId}:`, error);
          errorCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Orders synced successfully',
      synced: syncedCount,
      skipped: skippedCount,
      errors: errorCount
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

