const Clients = require("../models/Clients");
const Team = require("../models/Team");
const teamService = require("../services/teamService");

exports.loginProduction = async (req, res) => {
  try {
    const productionteams = await teamService.loginProduction(req.body);
    req.session.productionteams = productionteams._id;
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.loginSalesteam = async (req, res) => {
  try {
    const salesteams = await teamService.loginSalesteam(req.body);
    req.session.salesteams = salesteams._id;
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//Client Kyc

// Step 1: Create client KYC with auto-generated uniqueId
// Auto-generate a unique ID (e.g., C001, C002...)
const generateUniqueId = async () => {
  try {
    const lastClient = await Clients.findOne().sort({ createdAt: -1 });
    const lastNumber = lastClient
      ? parseInt(lastClient.uniqueId.replace(/^sonalika/i, "")) || 0
      : 0;
    const nextNumber = lastNumber + 1;
    return `sonalika${String(nextNumber).padStart(4, "0")}`.toLowerCase();
  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw new Error("Failed to generate unique ID");
  }
};

exports.createClientKYC = async (req, res) => {
  try {
    const { name, phone, address, gstNo, memoId } = req.body;

    // Validate required fields
    const requiredFields = { name, phone, address, gstNo };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value?.trim())
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        message: `The following fields are required: ${missingFields.join(", ")}`,
        missingFields: {
          name: !name,
          phone: !phone,
          address: !address,
          gstNo: !gstNo
        }
      });
    }

    // Validate phone format (10 digits)
    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({
        error: "Invalid phone number",
        message: "Phone number must be 10 digits"
      });
    }

    // Validate GST number format
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNo.trim())) {
      return res.status(400).json({
        error: "Invalid GST number",
        message: "Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)"
      });
    }

    // Check for existing client with same phone or GST
    const existingClient = await Clients.findOne({ 
      $or: [
        { phone: phone.trim() },
        { gstNo: gstNo.trim() }
      ]
    });

    if (existingClient) {
      const conflictField = existingClient.phone === phone.trim() ? 'phone' : 'GST number';
      return res.status(409).json({
        error: "Client exists",
        message: `Client with this ${conflictField} already exists`,
        clientId: existingClient._id,
        uniqueId: existingClient.uniqueId,
        conflictField
      });
    }

    // Generate unique ID
    const uniqueId = generateUniqueId(); // Implement your ID generation logic

    // Create new client with empty orders Map
    const client = new Clients({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      gstNo: gstNo.trim(),
      memoId: memoId?.trim(), // Optional field
      uniqueId,
      orders: new Map(), // Initialize empty Map for orders
      orderCounter: 0    // Initialize order counter
    });

   console.log('Before save:', uniqueId); // Should be "sonalika0001"
await client.save();
console.log('After save:', client.uniqueId); // Check if changed

    res.status(201).json({
      success: true,
      message: "Client KYC created successfully",
      client: {
        id: client._id,
        uniqueId: client.uniqueId,
        name: client.name,
        phone: client.phone,
        gstNo: client.gstNo,
        address: client.address,
        memoId: client.memoId,
        ordersCount: 0, // Explicitly showing no orders yet
        createdAt: client.createdAt
      }
    });

  } catch (error) {
    console.error("Error creating client KYC:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        error: "Validation failed",
        details: errors
      });
    }

    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(409).json({
        error: "Duplicate uniqueId",
        message: "This unique ID already exists"
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create client KYC",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};



// Helper function to generate unique ID


exports.getClients = async (req, res) => {
  try {
    const clients = await Clients.find().sort({ createdAt: -1 });
    res.status(200).json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
};

// Add order items to existing client by uniqueId or _id
// Add/Update order details for a client
//
exports.addClientOrder = async (req, res) => {
  try {
    const { uniqueId, memoId, orderItems } = req.body;

    if (!uniqueId) {
      return res.status(400).json({ error: "Unique ID is required" });
    }

    const client = await Clients.findOne({ uniqueId });
    if (!client) return res.status(404).json({ error: "Client not found" });

    const newOrder = {
      memoId,
      orderItems: Array.isArray(orderItems) ? orderItems : [],
      orderDate: new Date(),
    };

    client.order.push(newOrder);
    client.orderCounter += 1;

    await client.save();

    res.status(200).json({ message: "Order added successfully", client });
  } catch (err) {
    console.error("Add order error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



exports.getClientOrders = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    if (!uniqueId) {
      return res.status(400).json({
        error: "Unique ID is required",
        message: "Please provide client's unique ID"
      });
    }

    const client = await Clients.findOne({ uniqueId })
      .select("name uniqueId phone orders memoId");

    if (!client) {
      return res.status(404).json({
        error: "Client not found",
        message: "No client found with the provided unique ID"
      });
    }

    res.status(200).json({
      success: true,
      client: {
        name: client.name,
        uniqueId: client.uniqueId,
        phone: client.phone,
        memoId: client.memoId
      },
      orders: client.orders,
      count: client.orders.length
    });

  } catch (error) {
    console.error("Error in getClientOrders:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Could not fetch client orders"
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { uniqueId, srNo, orderStatus } = req.body;

    if (!uniqueId || !srNo || !orderStatus) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "uniqueId, srNo, and orderStatus are all required"
      });
    }

    if (!["received", "ongoing", "completed"].includes(orderStatus)) {
      return res.status(400).json({
        error: "Invalid status",
        message: "Status must be one of: received, ongoing, completed"
      });
    }

    const client = await Clients.findOne({ uniqueId });

    if (!client) {
      return res.status(404).json({
        error: "Client not found",
        message: "No client found with the provided unique ID"
      });
    }

    const orderIndex = client.orders.findIndex(o => o.srNo === srNo);

    if (orderIndex === -1) {
      return res.status(404).json({
        error: "Order not found",
        message: `No order found with srNo ${srNo} for this client`
      });
    }

    client.orders[orderIndex].orderStatus = orderStatus;
    await client.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      clientId: client._id,
      uniqueId: client.uniqueId,
      updatedOrder: {
        srNo,
        orderStatus
      }
    });

  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Could not update order status"
    });
  }
};


exports.getClientOrders = async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Clients.findById(clientId).select(
      "name uniqueId orderItems orderStatus"
    );

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json({
      clientId: client._id,
      clientName: client.name,
      uniqueId: client.uniqueId,
      orderStatus: client.orderStatus,
      orderItems: client.orderItems,
      totalOrders: client.orderItems.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     const { status } = req.body;

//     if (!['ongoing', 'completed'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status' });
//     }

//     const client = await Clients.findByIdAndUpdate(
//       clientId,
//       { orderStatus: status },
//       { new: true }
//     );

//     if (!client) {
//       return res.status(404).json({ error: 'Client not found' });
//     }

//     res.status(200).json({
//       message: 'Order status updated',
//       clientId: client._id,
//       newStatus: client.orderStatus
//     });

//   } catch (error) {
//     console.error('Error updating order status:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
