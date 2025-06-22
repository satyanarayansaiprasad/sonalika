
const mongoose = require("mongoose");
const orderItemSchema = new mongoose.Schema({
  srNo: Number,
  styleNo: String,
  clarity: String,
  grossWeight: Number,
  netWeight: Number,
  diaWeight: Number,
  pcs: Number,
  amount: Number,
  description: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // memoId: {
  //   type: String,
  //   default: undefined,
  //   trim: true
  // },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing"
  },
  orderItems: [orderItemSchema]
}, { _id: true }); // Keep _id for individual orders

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  uniqueId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: String,
  address: String,
  gstNo: String,
  orders: {
    type: Map,
    of: orderSchema,
    default: new Map()
  }
}, { timestamps: true });
module.exports = mongoose.model("Clients", clientSchema);




// const mongoose = require("mongoose");

// // Order Item Sub-schema
// const orderItemSchema = new mongoose.Schema({
//   srNo: Number,
//   styleNo: String,
//   clarity: String,
//   grossWeight: Number,  // GR WT
//   netWeight: Number,    // NT WT
//   diaWeight: Number,    // DIA WT
//   pcs: Number,
//   amount: Number,
//   description: String,
// }, { _id: false });

// // Order Sub-schema (embedded in Client)
// const orderSchema = new mongoose.Schema({
 
//   orderDate: {
//     type: Date,
//     default: Date.now,
//   },
//   status: {
//     type: String,
//     enum: ["ongoing", "completed"],
//     default: "ongoing",
//   },
//   orderItems: [orderItemSchema],
// }, { _id: false });

// // Main Client Schema
// const clientsSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     uniqueId: {
//       type: String,
//       required: true,
//       unique: true, // like sonalika0001
//       trim: true,
//     },
//     phone: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     address: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     gstNo: {
//       type: String,
//       trim: true,
//       default: null,
//     },
//   orders: {
//   type: [orderSchema],
//   default: [],
//   validate: {
//     validator: function(v) {
//       return Array.isArray(v);
//     },
//     message: props => `${props.value} is not a valid array!`
//   }
// },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Clients", clientsSchema);


// const mongoose = require("mongoose");

// // Order Item Sub-schema
// const orderItemSchema = new mongoose.Schema({
//   srNo: Number,
//   styleNo: String,
//   clarity: String,
//   grossWeight: Number,  // GR WT
//   netWeight: Number,    // NT WT
//   diaWeight: Number,    // DIA WT
//   pcs: Number,
//   amount: Number,
//   description: String,
// }, { _id: false });

// // Order Sub-schema (embedded in Client)
// const orderSchema = new mongoose.Schema({
 
//   orderDate: {
//     type: Date,
//     default: Date.now,
//   },
//   status: {
//     type: String,
//     enum: ["ongoing", "completed"],
//     default: "ongoing",
//   },
//   orderItems: [orderItemSchema],
// }, { _id: false });

// // Main Client Schema
// const clientsSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     uniqueId: {
//       type: String,
//       required: true,
//       unique: true, // like sonalika0001
//       trim: true,
//     },
//     phone: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     address: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     gstNo: {
//       type: String,
//       trim: true,
//       default: null,
//     },
//   orders: {
//   type: [orderSchema],
//   default: [],
//   validate: {
//     validator: function(v) {
//       return Array.isArray(v);
//     },
//     message: props => `${props.value} is not a valid array!`
//   }
// },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Clients", clientsSchema);
