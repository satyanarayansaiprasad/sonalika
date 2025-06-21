const mongoose = require("mongoose");

// Order Item Sub-schema
const orderItemSchema = new mongoose.Schema({
  srNo: Number,
  styleNo: String,
  clarity: String,
  grossWeight: Number,  // GR WT
  netWeight: Number,    // NT WT
  diaWeight: Number,    // DIA WT
  pcs: Number,
  amount: Number,
  description: String,
}, { _id: false });

// Order Sub-schema (embedded in Client)
const orderSchema = new mongoose.Schema({
  memoId: {
    type: String,
    trim: true,
    default: null,
    sparse: true, 
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing",
  },
  orderItems: [orderItemSchema],
}, { _id: false });

// Main Client Schema
const clientsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    uniqueId: {
      type: String,
      required: true,
      unique: true, // like sonalika0001
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    gstNo: {
      type: String,
      trim: true,
      default: null,
    },
    orders: [orderSchema], 
     default: []// embedded orders
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Clients", clientsSchema);
