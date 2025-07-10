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

  // ✅ New Fields
  companyName: {
    type: String,
    trim: true
  },
  msmeNumber: {
    type: String,
    trim: true
  },

  // Contact Information
  phone: String,
  mobile: String,
  officePhone: String,
  landline: String,
  email: String,

  // Address
  address: String,

  // Government Identifiers
  gstNo: String,
  companyPAN: String,
  ownerPAN: String,
  aadharNumber: {
    type: String,
    trim: true,
    match: [/^\d{12}$/, 'Aadhar number must be 12 digits']
  },
  importExportCode: String,

  // ✅ File Uploads (store path/URL as String)
  gstCertificate: String,
  companyPanDoc: String,
  aadharDoc: String,
  importExportDoc: String,
  msmeCertificate: String,
  visitingCard: String, // for address proof / visiting card

  // Orders
  orders: {
    type: Map,
    of: {
      orderDate: Date,
      status: {
        type: String,
        enum: ['ongoing', 'completed', 'cancelled'],
        default: 'ongoing'
      },
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
          total: Number,
          description: String
        }
      ]
    },
    default: new Map()
  }

}, { timestamps: true });

const Clienttss = mongoose.model('Clienttss', clienttssSchema);
module.exports = Clienttss;
