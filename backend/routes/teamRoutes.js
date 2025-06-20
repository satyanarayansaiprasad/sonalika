const express = require('express');
const router = express.Router();
const teamController = require('../controllers/TeamController');

router.post('/productionteam-login',teamController.loginProduction)
router.post('/salesteam-login',teamController.loginSalesteam)
router.post('/client-kyc',teamController.createClientKYC)
router.get('/get-clients',teamController.getClients)
router.post('/clients-order',teamController.createOrder)
router.get('/order-history',teamController.getClientOrders)
module.exports = router;