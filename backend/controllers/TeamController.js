const mongoose = require('mongoose'); // Add this line
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
// exports.createClientKYC = async (req, res) => {
//   try {
//     const { name, phone, address, gstNo } = req.body;

//     // Validate required fields with better error messages
//     const missingFields = [];
//     if (!name) missingFields.push('name');
//     if (!phone) missingFields.push('phone');
//     if (!address) missingFields.push('address');
//     if (!gstNo) missingFields.push('gstNo');
    
//     if (missingFields.length > 0) {
//       return res.status(400).json({ 
//         error: "Missing required fields",
//         missingFields,
//         message: `Please provide: ${missingFields.join(', ')}`
//       });
//     }

//     // Validate phone number format
//     const phoneRegex = /^[0-9]{10,15}$/;
//     if (!phoneRegex.test(phone)) {
//       return res.status(400).json({ 
//         error: "Invalid phone number",
//         message: "Phone number should be 10-15 digits"
//       });
//     }

//     // Generate unique ID safely
//     let uniqueId;
//     let attempts = 0;
//     const maxAttempts = 5;
    
//     do {
//       // Get count of clients (better than countDocuments for performance)
//       const lastClient = await Clients.findOne().sort({ _id: -1 }).limit(1);
//       const lastSerial = lastClient ? parseInt(lastClient.uniqueId.replace('sonalika', '')) || 0 : 0;
      
//       const nextSerial = lastSerial + 1;
//       const paddedSerial = String(nextSerial).padStart(4, "0");
//       uniqueId = `sonalika${paddedSerial}`;
      
//       attempts++;
//       if (attempts >= maxAttempts) {
//         return res.status(500).json({ 
//           error: "Unique ID generation failed",
//           message: "Please try again later"
//         });
//       }
//     } while (await Clients.exists({ uniqueId }));

//     // Create new client
//     const newClient = new Clients({
//       name: name.trim(),
//       phone: phone.trim(),
//       address: address.trim(),
//       gstNo: gstNo.trim().toUpperCase(),
//       uniqueId,
//       orders: []
//     });

//     // Validate before save (to catch schema validation errors)
//     await newClient.validate();

//     // Save to database
//     await newClient.save();

//     return res.status(201).json({
//       success: true,
//       message: "KYC submitted successfully",
//       data: {
//         clientId: newClient._id,
//         uniqueId: newClient.uniqueId,
//         name: newClient.name,
//         phone: newClient.phone,
//         orders:newClient.orders
//       }
//     });

//   } catch (error) {
//     console.error("Error submitting KYC:", error);
    
//     // Handle duplicate key errors (if unique constraint fails)
//     if (error.code === 11000) {
//       return res.status(409).json({
//         error: "Duplicate entry",
//         message: "Client with similar details already exists"
//       });
//     }
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         error: "Validation failed",
//         messages: errors
//       });
//     }
    
//     // Generic server error
//     return res.status(500).json({
//       error: "Internal Server Error",
//       message: "Could not process KYC request"
//     });
//   }
// };





exports.createClientKYC = async (req, res) => {
  try {
    const { name, phone, address, gstNo } = req.body;

    // Required field validation
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!phone) missingFields.push("phone");
    if (!address) missingFields.push("address");

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
        message: `Please provide: ${missingFields.join(", ")}`
      });
    }

    // Phone format check
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: "Invalid phone number",
        message: "Phone number should be 10-15 digits"
      });
    }

    // Generate uniqueId (like sonalika0001, sonalika0002)
    let uniqueId;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      const lastClient = await Clients.findOne().sort({ _id: -1 }).limit(1);
      const lastSerial = lastClient
        ? parseInt(lastClient.uniqueId.replace("sonalika", "")) || 0
        : 0;

      const nextSerial = lastSerial + 1;
      const paddedSerial = String(nextSerial).padStart(4, "0");
      uniqueId = `sonalika${paddedSerial}`;

      attempts++;
      if (attempts >= maxAttempts) {
        return res.status(500).json({
          error: "Unique ID generation failed",
          message: "Please try again later"
        });
      }
    } while (await Clients.exists({ uniqueId }));

    // Create and save new client
    const newClient = new Clients({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      gstNo: gstNo ? gstNo.trim().toUpperCase() : undefined,
      uniqueId,
      orders: new Map()
    });

    await newClient.validate();
    await newClient.save();

    return res.status(201).json({
      success: true,
      message: "KYC submitted successfully",
      data: {
        uniqueId: newClient.uniqueId,
        name: newClient.name,
        phone: newClient.phone,
        orders: Object.fromEntries(newClient.orders)
      }
    });

  } catch (error) {
    console.error("Error submitting KYC:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        error: "Duplicate entry",
        message: `Client with uniqueId ${error.keyValue.uniqueId} already exists`
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: "Validation failed",
        messages
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Could not process KYC request"
    });
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
exports.addClientOrder = async (req, res) => {
  try {
    const { uniqueId, orderItems } = req.body; // Changed from 'orders' to 'orderItems' to match schema

    // Validate required fields
    if (!uniqueId || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "uniqueId and at least one order item are required",
        details: {
          uniqueId: !uniqueId ? "Missing uniqueId" : "Valid",
          orderItems: !orderItems ? "Missing order items" 
                   : !Array.isArray(orderItems) ? "orderItems must be an array" 
                   : orderItems.length === 0 ? "At least one order item required" 
                   : "Valid"
        }
      });
    }

    // Validate each order item
    const invalidItems = [];
    orderItems.forEach((item, index) => {
      const errors = [];
      if (!item.styleNo) errors.push("styleNo is required");
      if (!item.pcs || isNaN(item.pcs) || item.pcs < 1) errors.push("valid pcs (≥1) is required");
      if (!item.amount || isNaN(item.amount)) errors.push("valid amount is required");
      if (errors.length > 0) {
        invalidItems.push({ itemIndex: index, errors });
      }
    });

    if (invalidItems.length > 0) {
      return res.status(400).json({
        error: "Invalid Order Items",
        message: "Some order items failed validation",
        invalidItems
      });
    }

    // Find client using uniqueId
    const client = await Clients.findOne({ uniqueId });
    if (!client) {
      return res.status(404).json({
        error: "Not Found",
        message: "Client not found with the provided uniqueId"
      });
    }

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    // Prepare new order
    const newOrder = {
      orderDate: new Date(),
      status: 'ongoing', // Default status
      orderItems: orderItems.map(item => ({  // Changed from 'orders' to 'orderItems' to match schema
        srNo: item.srNo || 0,
        styleNo: item.styleNo.trim(),
        clarity: item.clarity?.trim() || "",
        grossWeight: item.grossWeight || 0,
        netWeight: item.netWeight || 0,
        diaWeight: item.diaWeight || 0,
        pcs: item.pcs,
        amount: item.amount,
        description: item.description?.trim() || ""
      })
    )};

    // Add order to client's orders Map
    client.orders.set(orderId, newOrder);

    // Save the updated client document
    await client.save();

    // Get the newly added order from the Map
    const addedOrder = client.orders.get(orderId);

    return res.status(201).json({
      success: true,
      message: "Order added successfully",
      data: {
        orderId: orderId,
        orderDate: addedOrder.orderDate,
        status: addedOrder.status,
        itemCount: addedOrder.orderItems.length,
        clientDetails: {
          name: client.name,
          uniqueId: client.uniqueId
        }
      }
    });

  } catch (error) {
    console.error("Error adding client order:", error);

    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: "Invalid Format",
        message: "The provided uniqueId is not valid"
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "Validation Error",
        message: error.message
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate Key",
        message: "Order with this ID already exists"
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to process the order",
      systemMessage: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    } 
     else {
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
