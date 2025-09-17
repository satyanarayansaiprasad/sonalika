const mongoose = require('mongoose');

const productionteamSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["admin", "salesteam", "productionteam", "team"],
    default: "productionteam"
  }
}, { timestamps: true });

// Add compound index for faster login queries
productionteamSchema.index({ email: 1, role: 1 });

const ProductionTeam = mongoose.model('ProductionTeam', productionteamSchema);
module.exports = ProductionTeam;
