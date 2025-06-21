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
      ? parseInt(lastClient.uniqueId.replace("Sonalika", "")) || 0
      : 0;
    const nextNumber = lastNumber + 1;
    return `Sonalika${String(nextNumber).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw new Error("Failed to generate unique ID");
  }
};

exports.createClientKYC = async (req, res) => {
  try {
    const { name, phone, address, gstNo, memoId } = req.body;

    // Validate required fields
    const requiredFields = { name, phone, address };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value?.trim())
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
        message: `The following fields are required: ${missingFields.join(
          ", "
        )}`,
      });
    }

    // Validate GST number format if provided
    if (
      gstNo &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNo)
    ) {
      return res.status(400).json({
        error: "Invalid GST number format",
        message: "Please provide a valid GST number (e.g., 22AAAAA0000A1Z5)",
      });
    }

    // Check if a client already exists with this phone
    const existingClient = await Clients.findOne({ phone: phone.trim() });
    if (existingClient) {
      return res.status(409).json({
        error: "Client already exists",
        message: "A client with this phone number already exists",
        clientId: existingClient._id,
      });
    }

    // Generate unique ID
    const uniqueId = await generateUniqueId();

    // Create client without any orders initially
    const newClient = new Clients({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      gstNo: gstNo?.trim(),
      memoId: memoId?.trim(),
      uniqueId,
      orders: [], // explicit for clarity (can be omitted since default is empty)
    });

    await newClient.save();

    res.status(201).json({
      success: true,
      message: "Client KYC created successfully",
      client: {
        id: newClient._id,
        name: newClient.name,
        uniqueId: newClient.uniqueId,
        phone: newClient.phone,
      },
    });
  } catch (error) {
    console.error("Error in createClientKYC:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Could not create client KYC",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

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
exports.addOrderToClient = async (req, res) => {
  try {
    const { uniqueId, orders, memoId } = req.body;

    // Validate required fields
    if (!uniqueId) {
      return res.status(400).json({ 
        error: "Unique ID is required",
        message: "Please provide the client's unique ID"
      });
    }

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ 
        error: "Invalid order data",
        message: "At least one order item is required"
      });
    }

    // Validate each order item
    for (const order of orders) {
      if (!order.styleNo || !order.grossWeight || !order.pcs) {
        return res.status(400).json({
          error: "Missing required fields in order items",
          message: "Each order item must have styleNo, grossWeight, and pcs"
        });
      }
    }

    // Find client by uniqueId
    const client = await Clients.findOne({ uniqueId });

    if (!client) {
      return res.status(404).json({ 
        error: "Client not found",
        message: "No client found with the provided unique ID"
      });
    }

    // Generate sequential srNo for new orders
    let lastSrNo = client.orders.length > 0 
      ? Math.max(...client.orders.map(o => o.srNo)) 
      : 0;

    const newOrders = orders.map(order => ({
      ...order,
      srNo: ++lastSrNo,
      orderDate: new Date(),
      // Set default values if not provided
      clarity: order.clarity || "",
      netWeight: order.netWeight || 0,
      diaWeight: order.diaWeight || 0,
      amount: order.amount || 0,
      description: order.description || "",
      orderStatus: order.orderStatus || "received"
    }));

    // Add new orders to client
    client.orders.push(...newOrders);
    
    // Update memoId if provided
    if (memoId) {
      client.memoId = memoId.trim();
    }

    await client.save();

    res.status(200).json({
      success: true,
      message: "Orders added successfully",
      clientId: client._id,
      uniqueId: client.uniqueId,
      addedOrdersCount: newOrders.length,
      totalOrdersCount: client.orders.length
    });

  } catch (error) {
    console.error("Error in addOrderToClient:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: "Validation failed",
        details: errors
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Could not add orders to client",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
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
