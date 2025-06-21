const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  srNo: Number,
  styleNo: String,
  clarity: String,
  grossWeight: Number,  // GR WT
  netWeight: Number,    // NT WT
  diaWeight: Number,    // DIA WT
  pcs: Number,          // PCS
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
}, { _id: false });  // _id: false if you don't want each order item to get its own ObjectId


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
    type: [orderSchema],
    default: []
  }
}, {
  timestamps: true,
});


module.exports = mongoose.model("Clients", clientsSchema);
