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
}); // ✅ Closing this was missing

const ProductionTeam = mongoose.model('ProductionTeam', productionteamSchema);
module.exports = ProductionTeam;
