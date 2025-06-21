const mongoose = require("mongoose");
const orderItemSchema = new mongoose.Schema({
  srNo: Number,
  styleNo: String,
  clarity: String,
  grossWeight: Number,  // GR WT
  netWeight: Number,    // NT WT
  diaWeight: Number,    // DIA WT
  pcs: Number,   const mongoose = require("mongoose");

// Define order item schema with validation
const orderItemSchema = new mongoose.Schema({
  srNo: {
    type: Number,
    required: true,
    min: 1
  },
  styleNo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  clarity: {
    type: String,
    trim: true,
    maxlength: 30,
    default: ""
  },
  grossWeight: {  // GR WT
    type: Number,
    required: true,
    min: 0
  },
  netWeight: {    // NT WT
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v) {
        return v <= this.grossWeight;
      },
      message: "Net weight cannot be greater than gross weight"
    }
  },
  diaWeight: {    // DIA WT
    type: Number,
    default: 0,
    min: 0
  },
  pcs: {          // PCS
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ""
  },
}, { _id: false }); // Prevent automatic _id for subdocuments

const clientsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      maxlength: 100
    },
    uniqueId: {
      type: String,
      required: [true, "Unique ID is required"],
      unique: true,
      trim: true,
      maxlength: 50
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function(v) {
          return /^[0-9]{10,15}$/.test(v);
        },
        message: "Please enter a valid phone number"
      }
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: 500
    },
    gstNo: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
        },
        message: "Please enter a valid GST number"
      }
    },
    memoId: {
      type: String,
      trim: true,
      maxlength: 50
    },
    orderStatus: {
      type: String,
      enum: {
        values: ["ongoing", "completed"],
        message: "Status must be either 'ongoing' or 'completed'"
      },
      default: "ongoing"
    },
    orderItems: {
      type: [orderItemSchema],
      default: [],
      validate: {
        validator: function(v) {
          // Validate that all SR numbers are unique within this array
          const srNos = v.map(item => item.srNo);
          return new Set(srNos).size === srNos.length;
        },
        message: "Duplicate SR numbers found in order items"
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add index for better query performance
clientsSchema.index({ name: 1 });
clientsSchema.index({ uniqueId: 1 });
clientsSchema.index({ phone: 1 });
clientsSchema.index({ "orderItems.styleNo": 1 });

// Virtual for total order amount
clientsSchema.virtual("totalOrderAmount").get(function() {
  return this.orderItems.reduce((sum, item) => sum + (item.amount || 0), 0);
});

// Pre-save hook to ensure orderItems consistency
clientsSchema.pre("save", function(next) {
  if (this.orderItems && this.orderItems.length === 0) {
    this.orderStatus = "completed";
  }
  next();
});

module.exports = mongoose.model("Clients", clientsSchema);       // PCS
  amount: Number,
  description: String,
});

const clientsSchema = new mongoose.Schema(
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
    orderStatus: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
     orderItems: {
  type: [orderItemSchema],
  default: []
},

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Clients", clientsSchema);
