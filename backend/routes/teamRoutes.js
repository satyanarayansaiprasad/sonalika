const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/TeamController');

router.post('/productionteam-login',TeamController.loginProduction)
router.post('/salesteam-login',TeamController.loginSalesteam)
router.post('/create-client',TeamController.createUser)
 router.get('/get-clients',TeamController.getClienttss)
 router.post('/clients-order',TeamController.addClientOrder)
// .get('/order-history',TeamController.getOrderHistory)
module.exports = router;