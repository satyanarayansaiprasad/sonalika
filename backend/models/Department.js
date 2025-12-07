const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  description: { 
    type: String, 
    default: '' 
  },
  code: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  serialNumber: {
    type: Number,
    default: null
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
departmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate code from name if not provided
departmentSchema.pre('save', function(next) {
  if (!this.code && this.name) {
    // Generate code from name (first 3 letters, uppercase)
    this.code = this.name.substring(0, 3).toUpperCase().replace(/\s/g, '');
  }
  next();
});

module.exports = mongoose.model("Department", departmentSchema);

