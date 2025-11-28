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
    enum: ['pending', 'accepted', 'rejected'], 
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

