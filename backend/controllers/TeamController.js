const Clients = require('../models/Clients');
const teamService = require('../services/teamService');


exports.loginProduction = async (req, res) => {
  try {
    const productionteams = await teamService.loginProduction(req.body);
    req.session.productionteams = productionteams._id;
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.loginSalesteam = async (req, res) => {
  try {
    const salesteams = await teamService.loginSalesteam(req.body);
    req.session.salesteams = salesteams._id;
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};





//Client Kyc



// Step 1: Create client KYC with auto-generated uniqueId
exports.createClientKYC = async (req, res) => {
  try {
    const { name, phone, address, gstNo, memoId } = req.body;

    // Validate required fields
    if (!name || !phone || !address || !gstNo) {
      return res.status(400).json({ error: "All fields are required: name, phone, address, gstNo" });
    }

    // Get total clients to determine next serial number
    const clientCount = await Clients.countDocuments();

    // Generate next uniqueId like "Sonalika0001", "Sonalika0002"
    const nextSerial = clientCount + 1;
    const paddedSerial = String(nextSerial).padStart(4, "0");
    const uniqueId = `sonalika${paddedSerial}`;

    // Double check if uniqueId exists (edge case)
    const existingClient = await Clients.findOne({ uniqueId });
    if (existingClient) {
      return res.status(409).json({ error: "Client with this Unique ID already exists" });
    }

    // Save new client
    const newClient = new Clients({
      name,
      phone,
      address,
      gstNo,
      memoId,
      uniqueId,
    });

    await newClient.save();

    res.status(201).json({
      message: "KYC submitted successfully",
      clientId: newClient._id,
      uniqueId: newClient.uniqueId,
    });

  } catch (error) {
    console.error("Error submitting KYC:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.getClients = async (req, res) => {
  try {
    const clients = await Clients.find().sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      message: "Clients fetched successfully",
      total: clients.length,
      clients,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// Add order items to existing client by uniqueId or _id
exports.addOrderToClient = async (req, res) => {
  try {
    const { uniqueId, orderItems, orderStatus, memoId } = req.body;

    if (!uniqueId || !orderItems || !Array.isArray(orderItems)) {
      return res.status(400).json({ error: "Unique ID and valid order items are required" });
    }

    const client = await Clients.findOne({ uniqueId });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Push order items into existing client record
    client.orderItems.push(...orderItems);

    // Optional: update order status and memoId
    if (orderStatus) client.orders = orderStatus;
    if (memoId) client.memoId = memoId;

    await client.save();

    res.status(200).json({ message: "Order added to client successfully", client });

  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





// GET order history for a client
exports.getOrderHistory = async (req, res) => {
  try {
    const { uniqueId, clientId } = req.query;

    let client;

    // Find by uniqueId or _id
    if (uniqueId) {
      client = await Clients.findOne({ uniqueId });
    } else if (clientId) {
      client = await Clients.findById(clientId);
    } else {
      return res.status(400).json({ error: "Please provide uniqueId or clientId" });
    }

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Response with clean formatted fields
    res.status(200).json({
      name: client.name,
      uniqueId: client.uniqueId,
      memoId: client.memoId,
      phone: client.phone,
      orderStatus: client.orders,
      orderDate: client.orderDate,
      orderItems: client.orderItems,
    });

  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
