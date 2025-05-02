const express = require('express');
const router = express.Router();
const addressController = require('../controller/Address');

router.get('/get', addressController.getAllAddresses);
router.get('/:id', addressController.getAddressById);
router.post('/', addressController.createAddress);
router.put('/:id/update', addressController.updateAddress);
router.delete('/:id/delete', addressController.deleteAddress);

module.exports = router;
