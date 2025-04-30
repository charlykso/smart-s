const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address');

router.get('/addresses', addressController.getAllAddresses);
router.get('/addresses/:id', addressController.getAddressById);
router.post('/addresses', addressController.createAddress);
router.put('/addresses/:id', addressController.updateAddress);
router.delete('/addresses/:id', addressController.deleteAddress);

module.exports = router;
