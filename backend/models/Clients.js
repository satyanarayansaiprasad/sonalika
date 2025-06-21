const mongoose = require("mongoose");

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
}, { _id: true });  // Explicitly including _id for order items

const orderSchema = new mongoose.Schema({
  memoId: {
    type: String,
    required: true,
    // Ensure each order has a unique memoId
  },
  orderDate: { 
    type: Date, 
    default: Date.now 
  },
  orderItems: [orderItemSchema],
}, { timestamps: true });  // Adds createdAt and updatedAt fields

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
    unique: true,
    // lowercase: true,  // Automatically convert to lowercase
    trim: true       // Remove whitespace
  },
  orders: {  // Changed from 'order' to 'orders' (more semantic for an array)
    type: [orderSchema],
    default: []
  },
  orderCounter: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Clients = mongoose.model("Client", clientSchema);
module.exports=Clients;  // Singular "Client" is more conventional