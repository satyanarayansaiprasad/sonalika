const ProductionTeam = require('../models/ProductionTeam');
const SalesTeam = require('../models/SalesTeam');
exports.loginProduction = async ({ email, password, role }) => {
  // Use lean() for faster queries - returns plain JavaScript object instead of Mongoose document
  const productionteams = await ProductionTeam.findOne({ email, role }).lean();
  if (!productionteams) throw new Error('Invalid email or role');

  // Direct plain-text comparison
  if (password !== productionteams.password) throw new Error('Invalid password');

  return productionteams;
};


exports.loginSalesteam = async ({ email, password, role }) => {
  // Use lean() for faster queries - returns plain JavaScript object instead of Mongoose document
  const salesteams = await SalesTeam.findOne({ email, role }).lean();
  if (!salesteams) throw new Error('Invalid email or role');

  // Direct plain-text comparison
  if (password !== salesteams.password) throw new Error('Invalid password');

  return salesteams;
};