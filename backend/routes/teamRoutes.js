const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/TeamController');

router.post('/productionteam-login',TeamController.loginProduction)
router.post('/salesteam-login',TeamController.loginSalesteam)
router.post('/client-kyc',TeamController.createClientKYC)
 router.get('/get-clients',TeamController.getClients)
// router.post('/clients-order',teamController.addClientOrder)
// router.get('/order-history',teamController.getClientOrders)
module.exports = router;