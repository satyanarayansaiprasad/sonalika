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
    const Department = require('../models/Department');
    
    // First, check for accepted orders without currentDepartment and assign them to SL No. 1
    const unassignedOrders = await Order.find({ 
      status: 'accepted',
      $or: [
        { currentDepartment: null },
        { currentDepartment: { $exists: false } }
      ]
    });
    
    if (unassignedOrders.length > 0) {
      console.log(`Found ${unassignedOrders.length} accepted orders without currentDepartment. Assigning to SL No. 1...`);
      const firstDepartment = await Department.findOne({ serialNumber: 1 });
      
      if (firstDepartment) {
        for (const order of unassignedOrders) {
          order.currentDepartment = firstDepartment._id;
          if (!order.departmentStatus || order.departmentStatus.length === 0) {
            order.departmentStatus = [{
              department: firstDepartment._id,
              status: 'in_progress',
              completedAt: null,
              pendingAt: null,
              resolvedAt: null
            }];
          }
          await order.save();
          console.log(`✅ Assigned order ${order.orderId} to department ${firstDepartment.name} (SL: ${firstDepartment.serialNumber})`);
        }
      } else {
        console.warn('⚠️ No department with SL No. 1 found. Cannot auto-assign orders.');
      }
    }
    
    const orders = await Order.find({ status: 'accepted' })
      .populate('currentDepartment', 'name serialNumber')
      .populate('departmentStatus.department', 'name serialNumber')
      .populate('pendingMessages.department', 'name serialNumber')
      .sort({ acceptedDate: -1 });
    res.status(200).json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    console.error('Error in getAcceptedOrders:', error);
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
    const Department = require('../models/Department');
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

    // Find department with SL number 1 (serialNumber: 1)
    const firstDepartment = await Department.findOne({ serialNumber: 1 });
    
    if (!firstDepartment) {
      console.error('❌ No department with serialNumber 1 found');
      return res.status(400).json({ 
        success: false, 
        error: 'No department with SL number 1 found. Please create a department with SL number 1 first.' 
      });
    }

    console.log(`✅ Found department with SL No. 1: ${firstDepartment.name} (ID: ${firstDepartment._id})`);
    console.log(`📦 Assigning order ${orderId} to department ${firstDepartment.name} (SL: ${firstDepartment.serialNumber})`);

    // Update order status and assign to first department
    order.status = 'accepted';
    order.acceptedDate = new Date();
    order.currentDepartment = firstDepartment._id;
    
    // Initialize department status array for first department
    // Clear any existing departmentStatus to start fresh
    order.departmentStatus = [{
      department: firstDepartment._id,
      status: 'in_progress',
      completedAt: null,
      pendingAt: null,
      resolvedAt: null
    }];
    
    // Clear any existing pending messages
    order.pendingMessages = [];
    
    await order.save();
    
    // Populate department info for response
    await order.populate('currentDepartment', 'name serialNumber');
    await order.populate('departmentStatus.department', 'name serialNumber');

    console.log(`✅ Order ${orderId} successfully accepted and assigned to department ${firstDepartment.name}`);
    console.log(`📍 Order currentDepartment ID: ${order.currentDepartment?._id || order.currentDepartment}`);
    console.log(`📍 Order currentDepartment Name: ${order.currentDepartment?.name}`);
    console.log(`📍 Order currentDepartment SL: ${order.currentDepartment?.serialNumber}`);
    console.log(`📊 Order departmentStatus count: ${order.departmentStatus?.length || 0}`);
    if (order.departmentStatus && order.departmentStatus.length > 0) {
      console.log(`📊 First department status: ${order.departmentStatus[0].status}`);
      console.log(`📊 First department ID: ${order.departmentStatus[0].department?._id || order.departmentStatus[0].department}`);
    }

    // Emit Socket.IO event for real-time update
    if (global.io) {
      global.io.to('orders').emit('order-accepted', {
        order: order,
        message: `Order ${orderId} has been accepted and assigned to ${firstDepartment.name}`
      });
      console.log(`📡 Emitted order-accepted event for order ${orderId}`);
    }

    res.status(200).json({ 
      success: true, 
      data: order,
      message: 'Order accepted successfully and assigned to first department' 
    });
  } catch (error) {
    console.error('Error accepting order:', error);
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
            status: orderData.status === 'ongoing' ? 'pending' : 'pending',
            orderItems: orderData.orderItems || [] // Include order items from Sales
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

// Get completed orders
exports.getCompletedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'completed' })
      .populate('currentDepartment', 'name serialNumber')
      .populate('departmentStatus.department', 'name serialNumber')
      .sort({ completedDate: -1 });
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

// Get orders by department
exports.getOrdersByDepartment = async (req, res) => {
  try {
    const Department = require('../models/Department');
    const { departmentId } = req.params;
    
    console.log(`Fetching orders for department: ${departmentId}`);
    
    // Find orders where currentDepartment matches the departmentId
    const orders = await Order.find({ 
      currentDepartment: departmentId,
      status: 'accepted' // Only show accepted orders
    })
      .populate('currentDepartment', 'name serialNumber')
      .populate('departmentStatus.department', 'name serialNumber')
      .populate('pendingMessages.department', 'name serialNumber')
      .sort({ acceptedDate: -1 });
    
    console.log(`Found ${orders.length} orders for department ${departmentId}`);
    
    // Also check for accepted orders that don't have a currentDepartment assigned
    // and assign them to SL No. 1 if the requested department is SL No. 1
    const requestedDept = await Department.findById(departmentId);
    if (requestedDept && requestedDept.serialNumber === 1) {
      const unassignedOrders = await Order.find({ 
        status: 'accepted',
        $or: [
          { currentDepartment: null },
          { currentDepartment: { $exists: false } }
        ]
      });
      
      if (unassignedOrders.length > 0) {
        console.log(`Found ${unassignedOrders.length} accepted orders without currentDepartment. Assigning to SL No. 1...`);
        
        for (const order of unassignedOrders) {
          order.currentDepartment = requestedDept._id;
          if (!order.departmentStatus || order.departmentStatus.length === 0) {
            order.departmentStatus = [{
              department: requestedDept._id,
              status: 'in_progress',
              completedAt: null,
              pendingAt: null,
              resolvedAt: null
            }];
          }
          await order.save();
        }
        
        // Fetch the updated orders
        const updatedOrders = await Order.find({ 
          currentDepartment: departmentId,
          status: 'accepted'
        })
          .populate('currentDepartment', 'name serialNumber')
          .populate('departmentStatus.department', 'name serialNumber')
          .populate('pendingMessages.department', 'name serialNumber')
          .sort({ acceptedDate: -1 });
        
        console.log(`After assignment, found ${updatedOrders.length} orders for department ${departmentId}`);
        
        return res.status(200).json({ 
          success: true, 
          data: updatedOrders 
        });
      }
    }
    
    res.status(200).json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    console.error('Error in getOrdersByDepartment:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Move order to next department
exports.moveToNextDepartment = async (req, res) => {
  try {
    const Department = require('../models/Department');
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId }).populate('currentDepartment', 'serialNumber');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    if (order.status !== 'accepted') {
      return res.status(400).json({ 
        success: false, 
        error: 'Order must be accepted to move between departments' 
      });
    }

    if (!order.currentDepartment) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order has no current department assigned' 
      });
    }

    // Mark current department as completed
    const currentDeptStatus = order.departmentStatus.find(
      ds => ds.department.toString() === order.currentDepartment._id.toString()
    );
    if (currentDeptStatus) {
      currentDeptStatus.status = 'completed';
      currentDeptStatus.completedAt = new Date();
    }

    // Find next department by serial number
    const currentSerialNumber = order.currentDepartment.serialNumber;
    const nextDepartment = await Department.findOne({ 
      serialNumber: currentSerialNumber + 1 
    }).sort({ serialNumber: 1 });

    if (!nextDepartment) {
      // No more departments - mark order as completed
      order.status = 'completed';
      order.completedDate = new Date();
      order.currentDepartment = null;
    } else {
      // Move to next department
      order.currentDepartment = nextDepartment._id;
      
      // Add status for new department
      const existingStatus = order.departmentStatus.find(
        ds => ds.department.toString() === nextDepartment._id.toString()
      );
      if (!existingStatus) {
        order.departmentStatus.push({
          department: nextDepartment._id,
          status: 'in_progress',
          completedAt: null
        });
      } else {
        existingStatus.status = 'in_progress';
      }
    }

    await order.save();
    await order.populate('currentDepartment', 'name serialNumber');
    await order.populate('departmentStatus.department', 'name serialNumber');

    // Emit Socket.IO event for real-time update
    if (global.io) {
      if (nextDepartment) {
        global.io.to('orders').emit('order-moved', {
          order: order,
          message: `Order ${orderId} moved to ${nextDepartment.name}`
        });
      } else {
        global.io.to('orders').emit('order-completed', {
          order: order,
          message: `Order ${orderId} has been completed`
        });
      }
      console.log(`📡 Emitted order update event for order ${orderId}`);
    }

    res.status(200).json({ 
      success: true, 
      data: order,
      message: nextDepartment ? 'Order moved to next department' : 'Order completed successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Mark order as pending in current department
exports.markOrderPending = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Pending message is required' 
      });
    }

    const order = await Order.findOne({ orderId }).populate('currentDepartment');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    if (!order.currentDepartment) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order has no current department assigned' 
      });
    }

    // Update department status to blocked
    const deptStatus = order.departmentStatus.find(
      ds => ds.department.toString() === order.currentDepartment._id.toString()
    );
    if (deptStatus) {
      deptStatus.status = 'blocked';
      deptStatus.pendingMessage = message.trim();
    }

    // Add to pending messages
    order.pendingMessages.push({
      department: order.currentDepartment._id,
      message: message.trim(),
      createdAt: new Date()
    });

    await order.save();
    await order.populate('currentDepartment', 'name serialNumber');
    await order.populate('departmentStatus.department', 'name serialNumber');
    await order.populate('pendingMessages.department', 'name serialNumber');

    // Emit Socket.IO event for real-time update
    if (global.io) {
      global.io.to('orders').emit('order-pending', {
        order: order,
        message: `Order ${orderId} marked as pending in ${order.currentDepartment?.name}`
      });
      console.log(`📡 Emitted order-pending event for order ${orderId}`);
    }

    res.status(200).json({ 
      success: true, 
      data: order,
      message: 'Order marked as pending' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Resolve pending order
exports.resolvePending = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { resolvedMessage } = req.body;
    
    const order = await Order.findOne({ orderId }).populate('currentDepartment');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    if (!order.currentDepartment) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order has no current department assigned' 
      });
    }

    // Update department status back to in_progress
    const deptStatus = order.departmentStatus.find(
      ds => ds.department.toString() === order.currentDepartment._id.toString()
    );
    if (deptStatus) {
      deptStatus.status = 'in_progress';
      deptStatus.resolvedAt = new Date();
      deptStatus.resolvedBy = req.body.resolvedBy || 'Production Team';
      deptStatus.resolvedMessage = resolvedMessage || '';
    }

    // Mark pending messages as resolved
    order.pendingMessages.forEach(pm => {
      if (pm.department.toString() === order.currentDepartment._id.toString() && !pm.resolvedAt) {
        pm.resolvedAt = new Date();
        pm.resolvedBy = req.body.resolvedBy || 'Production Team';
        pm.resolvedMessage = resolvedMessage || '';
      }
    });

    await order.save();
    await order.populate('currentDepartment', 'name serialNumber');
    await order.populate('departmentStatus.department', 'name serialNumber');
    await order.populate('pendingMessages.department', 'name serialNumber');

    // Emit Socket.IO event for real-time update
    if (global.io) {
      global.io.to('orders').emit('order-resolved', {
        order: order,
        message: `Pending issue resolved for order ${orderId}`
      });
      console.log(`📡 Emitted order-resolved event for order ${orderId}`);
    }

    res.status(200).json({ 
      success: true, 
      data: order,
      message: 'Pending order resolved' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

