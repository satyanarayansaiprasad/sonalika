
const mongoose = require('mongoose');

const productionteamSchema = new mongoose.Schema({
 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ["admin", "salesteam", "productionteam","team"], 
    default: "productionteam" 
  },
}, { timestamps: true });


const ProductionTeam = mongoose.model('Productionteam', productionteamSchema);
module.exports=ProductionTeam;
