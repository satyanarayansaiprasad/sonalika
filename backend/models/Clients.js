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

// One complete order (with memoId and multiple order items)
const orderSchema = new mongoose.Schema({
  // memoId: {
  //   type: String,
  //   required: true  // ✅ Required ONLY when creating an order
  // },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderItems: {
    type: [orderItemSchema],
    default: []
  }
}, { _id: true, timestamps: true });  // ✅ keep timestamps

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
    type: [orderSchema],
    default: []  // ✅ No order/memoId is added at KYC time
  },
  orderCounter: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Clients = mongoose.model("Client", clientSchema);
module.exports = Clients;
