const express = require('express');
const router = express.Router();
const teamController = require('../controllers/TeamController');

router.post('/productionteam-login',teamController.loginProduction)
router.post('/salesteam-login',teamController.loginSalesteam)
module.exports = router;