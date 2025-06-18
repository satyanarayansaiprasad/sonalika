// const Admin = require('../models/Admin');
// const bcrypt = require('bcrypt');

// exports.loginAdmin = async ({ email, password }) => {
//   const admin = await Admin.findOne({ email });
//   if (!admin) throw new Error('Invalid email');

//   const isMatch = await bcrypt.compare(password, admin.password);
//   if (!isMatch) throw new Error('Invalid password');

//   return admin;
// };










const Admin = require('../models/Admin');

const Team = require('../models/Team');

exports.loginAdmin = async ({ email, password, role }) => {
  const admin = await Admin.findOne({ email, role });
  
  if (!admin) {
    throw new Error('Invalid email or role');
  }

  // Direct plain-text comparison (NOT SAFE for production)
  if (password !== admin.password) {
    throw new Error('Invalid password');
  }

  return admin;
};


// exports.loginTeam = async ({ email, password,role }) => {
//   const team = await Team.findOne({ email,role });
//   if (!team){throw new Error('Invalid email');} 

//   // Direct plain-text comparison
//   if (password !== team.password) {
//     throw new Error('Invalid password');
//   }
//   return team;
// };



exports.loginTeam = async ({ email, password, role }) => {
  const team = await Team.findOne({ email, role });
  
  if (!team) {
    throw new Error('Invalid email or role');
  }

  // Direct plain-text comparison (NOT SAFE for production)
  if (password !== team.password) {
    throw new Error('Invalid password');
  }

  return team;
};




