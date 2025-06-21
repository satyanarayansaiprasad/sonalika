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

  // ⬇️ Inline orderItems schema
  orderItems: {
    type: [
      {
        srNo: Number,
        styleNo: String,
        clarity: String,
        grossWeight: Number,  // GR WT
        netWeight: Number,    // NT WT
        diaWeight: Number,    // DIA WT
        pcs: Number,          // PCS
        amount: Number,
        description: String,
      }
    ],
    default: []
  }

}, {
  timestamps: true,
});

module.exports = mongoose.model("Clients", clientsSchema);
