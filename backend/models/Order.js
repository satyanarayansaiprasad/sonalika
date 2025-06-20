const mongoose = require("mongoose");

// Sub-schema for individual order items
const orderItemSchema = new mongoose.Schema({
  srNo: Number,
  styleNo: String,
  clarity: String,
  grossWeight: Number,   // GR WT
  netWeight: Number,     // NT WT
  diaWeight: Number,     // DIA WT
  pcs: Number,           // PCS
  amount: Number,
  description: String,
});

// Main client schema
const clientSchema = new mongoose.Schema(
  {
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
    order: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    orderItems: [orderItemSchema], // Embedded array of items
  },
  {
    timestamps: true,
  }
);

// Use singular, capitalized model name by convention
module.exports = mongoose.model("Client", clientSchema);
