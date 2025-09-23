// const mongoose = require('mongoose'); // Add this line

// const Users = require('../models/Users');
const Clienttss = require('../models/Clienttss');
const teamService = require('../services/teamService');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
//       const lastClient = await Clienttss.findOne().sort({ _id: -1 }).limit(1);
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
//     } while (await Clienttss.exists({ uniqueId }));

//     // Create new client
//     const newClient = new Clienttss({
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




// real one 
// exports.createClientKYC = async (req, res) => {
//   try {
//     const { name, phone, address, gstNo, } = req.body;

//     // Required field validation
//     const missingFields = [];
//     if (!name) missingFields.push("name");
//     if (!phone) missingFields.push("phone");
//     if (!address) missingFields.push("address");

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         error: "Missing required fields",
//         missingFields,
//         message: `Please provide: ${missingFields.join(", ")}`
//       });
//     }

//     // Phone format check
//     const phoneRegex = /^[0-9]{10,15}$/;
//     if (!phoneRegex.test(phone)) {
//       return res.status(400).json({
//         error: "Invalid phone number",
//         message: "Phone number should be 10-15 digits"
//       });
//     }

//     // Generate uniqueId (like sonalika0001, sonalika0002)
//     let uniqueId;
//     let attempts = 0;
//     const maxAttempts = 5;

//     do {
//       const lastClient = await Clienttss.findOne().sort({ _id: -1 }).limit(1);
//       const lastSerial = lastClient
//         ? parseInt(lastClient.uniqueId.replace("sonalika", "")) || 0
//         : 0;

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
//     } while (await Clienttss.exists({ uniqueId }));

//     // Create and save new client
//     const newClient = new Clienttss({
//       name: name.trim(),
//       phone: phone.trim(),
//       address: address.trim(),
//       gstNo: gstNo ? gstNo.trim().toUpperCase() : undefined,
//       uniqueId,
//       orders: new Map()
//     });

//     await newClient.validate();
//     await newClient.save();

//     return res.status(201).json({
//       success: true,
//       message: "KYC submitted successfully",
//       data: {
//         uniqueId: newClient.uniqueId,
//         name: newClient.name,
//         phone: newClient.phone,
//         orders: Object.fromEntries(newClient.orders)
//       }
//     });

//   } catch (error) {
//     console.error("Error submitting KYC:", error);

//     if (error.code === 11000) {
//       return res.status(409).json({
//         error: "Duplicate entry",
//         message: `Client with uniqueId ${error.keyValue.uniqueId} already exists`
//       });
//     }

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         error: "Validation failed",
//         messages
//       });
//     }

//     return res.status(500).json({
//       error: "Internal Server Error",
//       message: "Could not process KYC request"
//     });
//   }
// };






// Configure Multer storage

// Configure Multer storage

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
}).fields([
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'companyPanDoc', maxCount: 1 },
  { name: 'aadharDoc', maxCount: 1 },
  { name: 'importExportDoc', maxCount: 1 },
  { name: 'msmeCertificate', maxCount: 1 },
  { name: 'visitingCard', maxCount: 1 }
]);

exports.createUser = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).json({
        success: false,
        message: "File upload failed",
        error: err.message,
      });
    }

    const {
      name,
      companyName,
      phone,
      mobile,
      officePhone,
      landline,
      email,
      address,
      gstNo,
      companyPAN,
      ownerPAN,
      aadharNumber,
      importExportCode,
      msmeNumber
    } = req.body;

    // Required validation
    if (!name || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and address are required fields"
      });
    }

    if (aadharNumber && !/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({
        success: false,
        message: "Aadhar number must be 12 digits"
      });
    }

    try {
      // Generate unique ID
      let uniqueId;
      let attempts = 0;
      const maxAttempts = 5;

      do {
        const lastClient = await Clienttss.findOne().sort({ _id: -1 }).limit(1);
        const lastSerial = lastClient ? parseInt(lastClient.uniqueId?.replace("sonalika", "")) || 0 : 0;
        const nextSerial = lastSerial + 1;
        uniqueId = `sonalika${String(nextSerial).padStart(4, "0")}`;

        const exists = await Clienttss.exists({ uniqueId });
        if (!exists) break;

        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate unique ID"
        });
      }

      const newClient = new Clienttss({
        name: name.trim(),
        uniqueId,
        companyName: companyName?.trim(),
        phone: phone.trim(),
        mobile: mobile?.trim(),
        officePhone: officePhone?.trim(),
        landline: landline?.trim(),
        email: email?.trim(),
        address: address.trim(),
        gstNo: gstNo?.trim(),
        companyPAN: companyPAN?.trim(),
        ownerPAN: ownerPAN?.trim(),
        aadharNumber: aadharNumber?.trim(),
        importExportCode: importExportCode?.trim(),
        msmeNumber: msmeNumber?.trim(),
        gstCertificate: req.files?.gstCertificate?.[0]?.path,
        companyPanDoc: req.files?.companyPanDoc?.[0]?.path,
        aadharDoc: req.files?.aadharDoc?.[0]?.path,
        importExportDoc: req.files?.importExportDoc?.[0]?.path,
        msmeCertificate: req.files?.msmeCertificate?.[0]?.path,
        visitingCard: req.files?.visitingCard?.[0]?.path,
        orders: new Map()
      });

      await newClient.save();

      res.status(201).json({
        success: true,
        message: "Client created successfully",
        client: {
          _id: newClient._id,
          name: newClient.name,
          uniqueId: newClient.uniqueId,
          phone: newClient.phone,
          address: newClient.address,
        }
      });
    } catch (error) {
      console.error("Error creating client:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Client with this unique ID already exists"
        });
      }

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  });
};



// exports.getAllClients = async (req, res) => {
//   try {
//     const clients = await Clienttss.find({});
//     const formattedClients = clients.map(client => {
//       const clientData = client.toObject();
//       if (clientData.orders instanceof Map) {
//         clientData.orders = Array.from(clientData.orders.entries()).map(([id, order]) => ({
//           orderId: id,
//           ...order
//         }));
//       }
//       return clientData;
//     });
//     res.json({ success: true, clients: formattedClients });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };




//recent
// exports.getAllClients = async (req, res) => {
//   try {
//     const clients = await Clienttss.find({});

//     const formattedClients = clients.map(client => {
//       const clientData = client.toObject();

//       // Convert Map to Array (for orders)
//       if (clientData.orders instanceof Map || clientData.orders?.constructor.name === 'Object') {
//         clientData.orders = Object.entries(clientData.orders || {}).map(([orderId, orderData]) => ({
//           orderId,
//           ...orderData
//         }));
//       }

//       return clientData;
//     });

//     res.json({ success: true, clients: formattedClients });
//   } catch (err) {
//     console.error("Error fetching clients:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };




exports.getAllClients = async (req, res) => {
  try {
    const clients = await Clienttss.find({}); // No .lean() because Map support chahiye

    const formattedClients = clients.map(client => {
      const ordersMap = client.orders || new Map();

      // Convert Map to array
      const ordersArray = Array.from(ordersMap.entries()).map(([orderId, order]) => ({
        orderId,
        orderDate: order.orderDate,
        status: order.status,
        orderItems: (order.orderItems || []).map(item => ({
          srNo: item.srNo || 0,
          styleNo: item.styleNo || '',
          diamondClarity: item.diamondClarity || '',
          diamondColor: item.diamondColor || '',
          quantity: item.quantity || 0,
          grossWeight: item.grossWeight || 0,
          netWeight: item.netWeight || 0,
          diaWeight: item.diaWeight || 0,
          pcs: item.pcs || 0,
          amount: item.amount || 0,
          description: item.description || ''
        }))
      }));

      return {
        _id: client._id,
        name: client.name,
        uniqueId: client.uniqueId,
        phone: client.phone,
        mobile: client.mobile,
        officePhone: client.officePhone,
        landline: client.landline,
        email: client.email,
        address: client.address,
        gstNo: client.gstNo,
        companyPAN: client.companyPAN,
        ownerPAN: client.ownerPAN,
        aadharNumber: client.aadharNumber,
        importExportCode: client.importExportCode,
        orders: ordersArray,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      };
    });

    res.json({ success: true, clients: formattedClients });
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};







// exports.getClienttss = async (req, res) => {
//   try {
//     const clienttss = await Clienttss.find({});
    
//     // Convert to plain objects and handle the Map
//     const formattedClienttss = clienttss.map(client => {
//       const clientData = client.toObject();
      
//       // Convert orders Map to array if it exists
//       if (clientData.orders && clientData.orders instanceof Map) {
//         clientData.orders = Array.from(clientData.orders.entries()).map(([id, order]) => ({
//           orderId: id,
//           ...order
//         }));
//       }
      
//       return clientData;
//     });
    
//     res.json(formattedClienttss);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };





// Add order items to existing client by uniqueId or _id
exports.addClientOrder = async (req, res) => {
  try {
    const { uniqueId, orderItems, totalAmount, orderDescription, expectedCompletionDate } = req.body;
    
    // Debug logging
    console.log("Received order data:", {
      uniqueId,
      totalAmount,
      orderDescription,
      expectedCompletionDate,
      orderItemsCount: orderItems?.length,
      firstItem: orderItems?.[0]
    });

    // 1. Validate input
    if (!uniqueId || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "uniqueId and at least one valid order item are required",
      });
    }

    // 2. Validate each order item
    const invalidItems = orderItems.map((item, index) => {
      const errors = [];
      if (!item.styleNo) errors.push("styleNo is required");
      if (!item.quantity || isNaN(item.quantity) || item.quantity < 1)
        errors.push("quantity must be ≥ 1");
      return errors.length ? { itemIndex: index, errors } : null;
    }).filter(Boolean);

    if (invalidItems.length > 0) {
      return res.status(400).json({
        error: "Invalid Order Items",
        message: "Some items failed validation",
        invalidItems
      });
    }

    // 3. Find client
    const client = await Clienttss.findOne({ uniqueId });
    if (!client) {
      return res.status(404).json({
        error: "Not Found",
        message: `No client found with uniqueId: ${uniqueId}`
      });
    }

    // 4. Generate orderId
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    // 5. Prepare order object
    const newOrder = {
      orderDate: new Date(),
      status: 'ongoing',
      expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : null,
      totalAmount: totalAmount || null,
      orderDescription: orderDescription?.trim() || "",
      orderItems: orderItems.map(item => ({
        srNo: item.srNo || 0,
        styleNo: item.styleNo?.trim() || "",
        diamondClarity: item.diamondClarity?.trim() || "",
        diamondColor: item.diamondColor?.trim() || "",
        goldPurity: item.goldPurity?.trim() || "",
        goldColor: item.goldColor?.trim() || "",
        quantity: item.quantity || 0,
        grossWeight: parseFloat(item.grossWeight) || 0,
        netWeight: parseFloat(item.netWeight) || 0,
        diaWeight: parseFloat(item.diaWeight) || 0,
        pcs: item.pcs || 0,
        // amount: item.amount, // Removed - using order-level totalAmount instead
        // total: item.total || (item.amount * (item.quantity || 1)),
        remark: item.remark?.trim() || ""
      }))
    };

    // 6. Add to client's orders map
    client.orders.set(orderId, newOrder);

    // 7. Save
    await client.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        orderId,
        orderDate: newOrder.orderDate,
        status: newOrder.status,
        itemCount: newOrder.orderItems.length,
        client: {
          name: client.name,
          uniqueId: client.uniqueId
        }
      }
    });

  } catch (error) {
    console.error("Add order error:", error);
    return res.status(500).json({
      error: "Server Error",
      message: "Something went wrong while placing the order",
      systemMessage: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



exports.getOrderHistory = async (req, res) => {
  const { uniqueId } = req.params;

  try {
    const client = await Clienttss.findOne({ uniqueId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: `Client with Unique ID ${uniqueId} not found`
      });
    }

    const ordersMap = client.orders || new Map();

    // Convert Map to array
    const ordersArray = Array.from(ordersMap.entries()).map(([orderId, order]) => ({
      orderId,
      orderDate: order.orderDate,
      status: order.status,
      expectedCompletionDate: order.expectedCompletionDate,
      totalAmount: order.totalAmount,
      orderDescription: order.orderDescription,
      orderItems: (order.orderItems || []).map(item => ({
        srNo: item.srNo || 0,
        styleNo: item.styleNo || '',
        diamondClarity: item.diamondClarity || '',
        diamondColor: item.diamondColor || '',
        goldPurity: item.goldPurity || '',
        goldColor: item.goldColor || '',
        quantity: item.quantity || 0,
        grossWeight: item.grossWeight || 0,
        netWeight: item.netWeight || 0,
        diaWeight: item.diaWeight || 0,
        pcs: item.pcs || 0,
        amount: item.amount || 0,
        remark: item.remark || item.description || '' // Support both old and new field names
      }))
    }));

    res.json({
      success: true,
      clientName: client.name,
      uniqueId: client.uniqueId,
      orders: ordersArray
    });
  } catch (err) {
    console.error("Error fetching order history:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
