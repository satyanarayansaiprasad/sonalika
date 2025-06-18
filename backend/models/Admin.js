
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ["admin", "salesteam", "productionteam","team"], 
    default: "admin" 
  },
}, { timestamps: true });


const Admin= mongoose.model('Admin', AdminSchema);
module.exports=Admin;























// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const adminSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// });

// adminSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// module.exports = mongoose.model('Admin', adminSchema);
