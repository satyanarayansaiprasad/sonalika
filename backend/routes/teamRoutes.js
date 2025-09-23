const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/TeamController');

router.post('/productionteam-login', TeamController.loginProduction);
router.post('/salesteam-login', TeamController.loginSalesteam);
router.post('/create-client', TeamController.createUser);
router.get('/get-clients', TeamController.getAllClients);
router.post('/client-orders', TeamController.addClientOrder);
router.get('/order-history/:uniqueId', TeamController.getOrderHistory);
router.put('/update-client/:id', TeamController.updateClient);
router.delete('/delete-client/:id', TeamController.deleteClient);
module.exports = router;