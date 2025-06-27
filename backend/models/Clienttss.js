const mongoose = require("mongoose");

const clienttssSchema = new mongoose.Schema({
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
  // Contact Information
  phone: String,
  mobile: String,//alternate phone
  officePhone: String,
  landline: String,
  email: String,
  
  
  // Address Information
  address: String,
  
  
  // Government Identifiers (all optional)
  gstNo: String,
  companyPAN: String,
  ownerPAN: String,
  aadharNumber: {  // Aadhar card number (12 digits)
    type: String,
    trim: true,
    match: [/^\d{12}$/, 'Aadhar number must be 12 digits'] // Optional validation
  },
  importExportCode: String,
  
 
  
  orders: {
  type: Map,
  of: {
    orderDate: Date,
    status: String,
    orderItems: [
      {
        srNo: Number,
        styleNo: String,
        diamondClarity: String,
        diamondColor: String,
        quantity: Number,
        grossWeight: Number,
        netWeight: Number,
        diaWeight: Number,
        pcs: Number,
        amount: Number,
        description: String
      }
    ]
  },
  default: new Map()
}

}, { timestamps: true });
 const Clienttss=mongoose.model('Clienttss',clienttssSchema)
module.exports =Clienttss;




// const Team = mongoose.model('Team', TeamSchema);
// module.exports=Team;






// const mongoose = require("mongoose");
// const clientSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   uniqueId: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   phone: String,
//   address: String,
//   gstNo: String,

//   orders: {
//   type: Map,
//   of: {
//     orderDate: Date,
//     status: String,
//     orderItems: [
//       {
//         srNo: Number,
//         styleNo: String,
//         clarity: String,
//         grossWeight: Number,
//         netWeight: Number,
//         diaWeight: Number,
//         pcs: Number,
//         amount: Number,
//         description: String
//       }
//     ]
//   },
//   default: new Map()
// }

// }, { timestamps: true });
// module.exports = mongoose.model("Clients", clientSchema);




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
