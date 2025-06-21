const mongoose = require("mongoose");

// Single item inside an order
const orderItemSchema = new mongoose.Schema({
  styleNo: String,
  clarity: String,
  grossWeight: Number,
  netWeight: Number,
  diaWeight: Number,
  pcs: Number,
  amount: Number,
  description: String,
  orderStatus: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing",
  },
}, { _id: true });

// Main client schema
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: String,
  gstNo: String,
  uniqueId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  orders: {
    type: Map,  // Changed from Array to Map
    of: {       // Each order will be stored with orderNumber as key
      orderDate: {
        type: Date,
        default: Date.now,
      },
      orderItems: {
        type: [orderItemSchema],
        default: []
      }
    },
    default: {}  // Default empty object instead of array
  },
  orderCounter: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Clients = mongoose.model("Client", clientSchema);
module.exports = Clients;