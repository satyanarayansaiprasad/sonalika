const mongoose = require('mongoose');

const DesignMasterSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true },
  styleNumber: { type: String, required: true, unique: true },
  grossWt: { type: Number, default: 0 },
  netWt: { type: Number, default: 0 },
  diaWt: { type: Number, default: 0 },
  diaPcs: { type: Number, default: 0 },
  clarity: { type: String, default: 'vvs' },
  color: { type: String, default: 'e-f' },
    imageFile: { type: String,  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DesignMaster', DesignMasterSchema);