
const adminService = require('../services/adminService');

exports.login = async (req, res) => {
  try {
    const {  user } = await adminService.loginAdmin(req.body);
    
    res.status(200).json({ 
      success: true,
      
      user,
      message: 'Login successful' 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};



exports.loginteam = async (req, res) => {
  try {
    const { user } = await adminService.loginTeam(req.body);
    res.status(200).json({ 
      success: true,
      user,
      message: 'Login successful' 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: 'Logged out' });
  });
};


