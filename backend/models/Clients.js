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
    enum: ["received", "ongoing", "completed"],
    default: "received"
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const clientsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  uniqueId: {
    type: String,
    required: true,
    unique: true,
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
  },
  memoId: {
    type: String,
    trim: true,
  },
  orders: {
    type: Map,  // Using Map for object storage
    of: orderItemSchema,
    default: {}  // Default empty object
  },
  orderCounter: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model("Clients", clientsSchema);