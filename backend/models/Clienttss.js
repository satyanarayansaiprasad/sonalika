const mongoose = require("mongoose");
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uniqueId: { type: String, required: true, unique: true },
  companyName: String,
  phone: { type: String, required: true },
  mobile: String,
  officePhone: String,
  landline: String,
  email: String,
  address: { type: String, required: true },
  gstNo: String,
  companyPAN: String,
  ownerPAN: String,
  aadharNumber: String,
  importExportCode: String,
  msmeNumber: String,
  igi: String,
  huid: String,
  diamondWeightLazerMarking: String,

  // 🔽 Add these if you're uploading files
  gstCertificate: String,
  companyPanDoc: String,
  aadharDoc: String,
  importExportDoc: String,
  msmeCertificate: String,
  visitingCard: String,

  orders: {
    type: Map,
    of: {
      orderDate: String,
      status: String,
      expectedCompletionDate: Date,
      totalAmount: Number,
      orderDescription: String,
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
          goldPurity: String,
          goldColor: String,
          pcs: Number,
          mmSize: Number,
          seiveSize: String,
          sieveSizeRange: String,
          remark: String
        }
      ]
    },
    default: {},
  },

  createdAt: { type: Date, default: Date.now },
});

exports = mongoose.model("Clienttss", clientSchema);
module.exports = mongoose.model("Clienttss", clientSchema);