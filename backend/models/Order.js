const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  orderDate: { 
    type: String, 
    required: true 
  },
  clientName: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  gold: {
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'grams' }
  },
  diamond: {
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'carats' }
  },
  silver: {
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'grams' }
  },
  platinum: {
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'grams' }
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'completed'], 
    default: 'pending' 
  },
  rejectionReason: { 
    type: String, 
    default: '' 
  },
  acceptedDate: { 
    type: Date 
  },
  rejectedDate: { 
    type: Date 
  },
  completedDate: {
    type: Date
  },
  currentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  departmentStatus: [{
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'blocked'],
      default: 'pending'
    },
    completedAt: Date,
    pendingMessage: String,
    resolvedAt: Date,
    resolvedBy: String,
    resolvedMessage: String
  }],
  pendingMessages: [{
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date,
    resolvedBy: String,
    resolvedMessage: String
  }],
  orderItems: [ // Array to store detailed order items from Sales
    {
      srNo: Number,
      styleNo: String,
      diamondClarity: String,
      diamondColor: String,
      quantity: Number, // This quantity refers to the number of pieces of this specific item
      grossWeight: Number,
      netWeight: Number,
      diaWeight: Number,
      goldPurity: String,
      goldColor: String,
      pcs: Number, // This pcs refers to diamond pieces in this item
      mmSize: Number,
      seiveSize: String,
      sieveSizeRange: String,
      remark: String
    }
  ],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Order", orderSchema);

