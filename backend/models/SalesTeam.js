
const mongoose = require('mongoose');

const salesTeamSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ["admin", "salesteam", "productionteam","team"], 
    default: "salesteam" 
  },
}, { timestamps: true });

// Add compound index for faster login queries
salesTeamSchema.index({ email: 1, role: 1 });


const SalesTeam = mongoose.model('SalesTeam', salesTeamSchema);
module.exports=SalesTeam;
