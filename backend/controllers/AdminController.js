
const adminService = require('../services/adminService');

exports.login = async (req, res) => {
  try {
    const { admin, token } = await adminService.loginAdmin(req.body, req);
    
    res.status(200).json({ 
      success: true,
      user: admin,
      token,
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
    const { team, token } = await adminService.loginTeam(req.body, req);
    res.status(200).json({ 
      success: true,
      user: team,
      token,
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


