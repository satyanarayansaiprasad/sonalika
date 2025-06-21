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
    enum: [ 'ongoing', 'completed'],
    default: 'ongoing'
  }
});

const orderSchema = new mongoose.Schema({
  memoId: String,
  orderDate: { type: Date, default: Date.now },
  orderItems: [orderItemSchema]
});

const clientSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  gstNo: String,
  uniqueId: String,
  orders: [orderSchema], // ✅ One client can have multiple orders
  orderCounter: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Clients", clientSchema);
