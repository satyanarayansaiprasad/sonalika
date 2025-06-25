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

const jwt = require('jsonwebtoken');

exports.loginAdmin = async ({ email, password, role }, req) => {
  try {
    // Find admin by email and role
    const admin = await Admin.findOne({ email, role });
    
    if (!admin) {
      throw new Error('Invalid email or role');
    }

    // Direct plain-text comparison (NOT SAFE for production)
    if (password !== admin.password) {
      throw new Error('Invalid password');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
       
        email: admin.email,
       
        role: admin.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    // If request object is provided, handle session
    if (req) {
      req.session.userType = "admin";
      req.session.admin = {
        id: admin._id,
        
        email: admin.email,
        
        role: admin.role,
      };

      // Save session
      await new Promise((resolve, reject) => {
        req.session.save(err => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    return {
      admin,
      token,
      session: req ? req.session.admin : null
    };

  } catch (error) {
    console.error("Login Error:", error);
    throw error; // Re-throw the error for the caller to handle
  }
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




