const mongoose = require("mongoose");

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
  orderStatus: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing",
  },

  // Order fields
  srNo: {
    type: Number
  },
  styleNo: {
    type: String
  },
  clarity: {
    type: String
  },
  grossWeight: {  // GR WT
    type: Number
  },
  netWeight: {    // NT WT
    type: Number
  },
  diaWeight: {    // DIA WT
    type: Number
  },
  pcs: {          // PCS
    type: Number
  },
  amount: {
    type: Number
  },
  description: {
    type: String
  }

}, {
  timestamps: true,
});

module.exports = mongoose.model("Clients", clientsSchema);