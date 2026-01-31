const mongoose = require("mongoose");

const metalHistorySchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  metal: {
    type: String,
    required: true,
    enum: ['gold', 'silver', 'copper', 'platinum', 'diamond', 'other']
  },
  clientSide: {
    type: Number,
    required: true,
    default: 0
  },
  companySide: {
    type: Number,
    required: true,
    default: 0
  },
  totalQuantity: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['received', 'returned'],
    default: 'returned'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("MetalHistory", metalHistorySchema);
