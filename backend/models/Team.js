
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ["admin", "salesteam", "productionteam","team"], 
    default: "team" 
  },
}, { timestamps: true });


const Team = mongoose.model('Team', TeamSchema);
module.exports=Team;
