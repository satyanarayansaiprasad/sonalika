const mongoose = require("mongoose");

const  clientsSchema = new mongoose.Schema(
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
    orders: {
      type: String,
      enum: ['ongoing', 'completed'],
      default: 'ongoing'
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Clients", clientsSchema);