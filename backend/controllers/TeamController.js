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

// // Step 1: Create client KYC with auto-generated uniqueId
// const generateUniqueId = async () => {
//   try {
//     const lastClient = await Clients.findOne().sort({ createdAt: -1 });

//     // Extract number from last client or start from 0
//     const lastNumber = lastClient
//       ? parseInt(lastClient.uniqueId.replace(/^[a-z]+/i, "")) || 0
//       : 0;

//     const nextNumber = lastNumber + 1;
//     return `sonalika${String(nextNumber).padStart(4, "0")}`.toLowerCase(); // ✅ FORCE lowercase
//   } catch (error) {
//     console.error("Error generating unique ID:", error);
//     throw new Error("Failed to generate unique ID");
//   }
// // };

exports.createClientKYC = async (req, res) => {
  try {
    const { name, phone, address, gstNo, memoId } = req.body;

    // Validate required fields
    if (!name || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and address are required fields",
        missingFields: {
          name: !name,
          phone: !phone,
          address: !address
        }
      });
    }

    // Trim all input fields
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();
    const trimmedGstNo = gstNo?.trim();
    const trimmedMemoId = memoId?.trim();

    // Validate phone format (10 digits)
    if (!/^\d{10}$/.test(trimmedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits"
      });
    }

    // Validate GST number format if provided
    if (trimmedGstNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(trimmedGstNo)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)"
      });
    }

    // Check for existing client with same phone
    const existingClient = await Clients.findOne({
      $or: [
        { phone: trimmedPhone },
        ...(trimmedGstNo ? [{ gstNo: trimmedGstNo }] : []),
        ...(trimmedMemoId ? [{ memoId: trimmedMemoId }] : [])
      ]
    });

    if (existingClient) {
      let conflictField = 'phone';
      if (existingClient.gstNo === trimmedGstNo) conflictField = 'GST number';
      if (existingClient.memoId === trimmedMemoId) conflictField = 'memo ID';

      return res.status(409).json({
        success: false,
        message: `Client with this ${conflictField} already exists`,
        data: {
          clientId: existingClient._id,
          uniqueId: existingClient.uniqueId,
          conflictField
        }
      });
    }

    // Generate sequential unique ID (format: sonalikaXXXX)
    const lastClient = await Clients.findOne(
      { uniqueId: /^sonalika\d{4}$/i },
      {},
      { sort: { uniqueId: -1 } }
    );

    let nextNumber = 1; // Start with 0001 if no clients exist
    if (lastClient && lastClient.uniqueId) {
      const matches = lastClient.uniqueId.toLowerCase().match(/sonalika(\d+)$/);
      if (matches && matches[1]) {
        nextNumber = parseInt(matches[1]) + 1;
      }
    }

    const uniqueId = `sonalika${String(nextNumber).padStart(4, '0')}`.toLowerCase();

    // Create new client
    const newClient = await Clients.create({
      name: trimmedName,
      phone: trimmedPhone,
      address: trimmedAddress,
      gstNo: trimmedGstNo,
      memoId: trimmedMemoId,
      uniqueId,
      orders: [] // Initialize with empty array of orders
    });

    return res.status(201).json({
      success: true,
      message: "Client KYC created successfully",
      data: {
        client: {
          id: newClient._id,
          uniqueId: newClient.uniqueId,
          name: newClient.name,
          phone: newClient.phone,
          address: newClient.address,
          gstNo: newClient.gstNo,
          memoId: newClient.memoId,
          orders: newClient.orders,
          createdAt: newClient.createdAt,
          updatedAt: newClient.updatedAt
        }
      }
    });

  } catch (error) {
    console.error("Error creating client KYC:", error);

    // Handle duplicate uniqueId error
    if (error.code === 11000 && error.keyPattern?.uniqueId) {
      return res.status(409).json({
        success: false,
        message: "Generated unique ID already exists. Please try again."
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    // Generic error handler
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Migration script for existing data (run once)
// exports.migrateToLowercaseIds = async () => {
//   try {
//     const clients = await Clients.find({
//       uniqueId: { $regex: /sonalika/i } // Case-insensitive match
//     });

//     let updateCount = 0;

//     for (const client of clients) {
//       const currentId = client.uniqueId;
//       const lowercaseId = currentId.toLowerCase();

//       if (currentId !== lowercaseId) {
//         client.uniqueId = lowercaseId;
//         await client.save();
//         updateCount++;
//         console.log(`Updated ${currentId} → ${lowercaseId}`);
//       }
//     }

//     return {
//       totalClients: clients.length,
//       updatedCount: updateCount,
//       message: `Updated ${updateCount} client IDs to lowercase`
//     };

//   } catch (error) {
//     console.error("Migration error:", error);
//     throw error;
//   }
// };

// Helper function to generate unique ID

// exports.getClients = async (req, res) => {
//   try {
//     const clients = await Clients.find().sort({ createdAt: -1 });
//     res.status(200).json({ clients });
//   } catch (error) {
//     console.error("Error fetching clients:", error);
//     res.status(500).json({ error: "Failed to fetch clients" });
//   }
// };

// Add order items to existing client by uniqueId or _id
// Add/Update order details for a client
//
// Adjust path if needed

// exports.addClientOrder = async (req, res) => {
//   try {
//     const { uniqueId, memoId, orderItems } = req.body;

//     // 1. Validate required fields
//     if (!uniqueId) {
//       return res.status(400).json({
//         error: "Unique ID is required",
//         example: "Sonalika0001"
//       });
//     }

//     // // 2. Validate ID format
//     // if (!/^Sonalika\d{4}$/.test(uniqueId)) {
//     //   return res.status(400).json({
//     //     error: "Invalid ID format",
//     //     message: "Must be 'Sonalika' followed by 4 digits (e.g., Sonalika0001)",
//     //     received: uniqueId
//     //   });
//     // }

//     // 3. Find client
//     const client = await Clients.findOne({ uniqueId });

//     if (!client) {
//       return res.status(404).json({
//         error: "Client not found",
//         details: {
//           searchedId: uniqueId,
//           suggestion: "Verify the client exists with this exact ID"
//         }
//       });
//     }

//     // 4. Validate order items
//     if (!Array.isArray(orderItems) || orderItems.length === 0) {
//       return res.status(400).json({
//         error: "Order items required",
//         message: "Provide at least one order item"
//       });
//     }

//     // 5. Build new order matching the schema
//     const newOrder = {
//       memoId: memoId?.trim() || "",
//       orderItems: orderItems.map(item => ({
//         styleNo: item.styleNo || "",
//         clarity: item.clarity || "",
//         grossWeight: Number(item.grossWeight) || 0,
//         netWeight: Number(item.netWeight) || 0,
//         diaWeight: Number(item.diaWeight) || 0,
//         pcs: Number(item.pcs) || 0,
//         amount: Number(item.amount) || 0,
//         description: item.description || "",
//         orderStatus: item.orderStatus || "ongoing"
//       })),
//       orderDate: new Date()
//     };

//     // 6. Update and save
//     client.order.push(newOrder);
//     client.orderCounter = (client.orderCounter || 0) + 1;

//     await client.save();

//     // 7. Response
//     res.status(201).json({
//       success: true,
//       message: "Order added successfully",
//       order: {
//         clientId: client._id,
//         uniqueId: client.uniqueId,
//         orderNumber: client.orderCounter,
//         orderItems: newOrder.orderItems.length,
//         totalAmount: newOrder.orderItems.reduce((sum, item) => sum + item.amount, 0),
//         memoId: newOrder.memoId,
//         createdAt: newOrder.orderDate
//       }
//     });

//   } catch (error) {
//     console.error("Order creation failed:", error);

//     res.status(500).json({
//       error: "Internal server error",
//       message: error.message
//     });
//   }
// };

// exports.getClientOrders = async (req, res) => {
//   try {
//     const { uniqueId } = req.params;

//     if (!uniqueId) {
//       return res.status(400).json({
//         error: "Unique ID is required",
//         message: "Please provide client's unique ID"
//       });
//     }

//     const client = await Clients.findOne({ uniqueId })
//       .select("name uniqueId phone orders memoId");

//     if (!client) {
//       return res.status(404).json({
//         error: "Client not found",
//         message: "No client found with the provided unique ID"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       client: {
//         name: client.name,
//         uniqueId: client.uniqueId,
//         phone: client.phone,
//         memoId: client.memoId
//       },
//       orders: client.orders,
//       count: client.orders.length
//     });

//   } catch (error) {
//     console.error("Error in getClientOrders:", error);
//     res.status(500).json({
//       error: "Internal server error",
//       message: "Could not fetch client orders"
//     });
//   }
// };

// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { uniqueId, srNo, orderStatus } = req.body;

//     if (!uniqueId || !srNo || !orderStatus) {
//       return res.status(400).json({
//         error: "Missing required fields",
//         message: "uniqueId, srNo, and orderStatus are all required"
//       });
//     }

//     if (!["received", "ongoing", "completed"].includes(orderStatus)) {
//       return res.status(400).json({
//         error: "Invalid status",
//         message: "Status must be one of: received, ongoing, completed"
//       });
//     }

//     const client = await Clients.findOne({ uniqueId });

//     if (!client) {
//       return res.status(404).json({
//         error: "Client not found",
//         message: "No client found with the provided unique ID"
//       });
//     }

//     const orderIndex = client.orders.findIndex(o => o.srNo === srNo);

//     if (orderIndex === -1) {
//       return res.status(404).json({
//         error: "Order not found",
//         message: `No order found with srNo ${srNo} for this client`
//       });
//     }

//     client.orders[orderIndex].orderStatus = orderStatus;
//     await client.save();

//     res.status(200).json({
//       success: true,
//       message: "Order status updated successfully",
//       clientId: client._id,
//       uniqueId: client.uniqueId,
//       updatedOrder: {
//         srNo,
//         orderStatus
//       }
//     });

//   } catch (error) {
//     console.error("Error in updateOrderStatus:", error);
//     res.status(500).json({
//       error: "Internal server error",
//       message: "Could not update order status"
//     });
//   }
// };

// exports.getClientOrders = async (req, res) => {
//   try {
//     const { clientId } = req.params;

//     const client = await Clients.findById(clientId).select(
//       "name uniqueId orderItems orderStatus"
//     );

//     if (!client) {
//       return res.status(404).json({ error: "Client not found" });
//     }

//     res.status(200).json({
//       clientId: client._id,
//       clientName: client.name,
//       uniqueId: client.uniqueId,
//       orderStatus: client.orderStatus,
//       orderItems: client.orderItems,
//       totalOrders: client.orderItems.length,
//     });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

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








 

// exports.createClientKYC = async (req, res) => {
//   try {
//     const { name, address, gstNo, phone } = req.body;

//     // Validate mandatory fields
//     if (!name || !address || !gstNo || !phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, address, GST number, and phone are required fields",
//       });
//     }

//     // Generate next uniqueId
//     const lastClient = await Clients.findOne(
//       { uniqueId: /^sonalika\d{4}$/i },
//       {},
//       { sort: { uniqueId: -1 } }
//     );

//     let nextNumber = 1;
//     if (lastClient) {
//       const lastNumber = parseInt(
//         lastClient.uniqueId.replace("sonalika", ""),
//         10
//       );
//       nextNumber = lastNumber + 1;
//     }

//     const uniqueId = `sonalika${nextNumber.toString().padStart(4, "0")}`;

//     // Create client with empty orders object
//     const newClient = await Clients.create({
//       name,
//       address,
//       gstNo,
//       phone,
//       uniqueId,
//       orders: [],          // Now using empty object instead of array
//       orderCounter: 0,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Client KYC created successfully",
//       data: {
//         client: newClient,
//         uniqueId: newClient.uniqueId,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating client KYC:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// Example of how to add an order to a client



exports.getClients = async (req, res) => {
  try {
    const clients = await Clients.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Clients fetched successfully",
      clients,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};