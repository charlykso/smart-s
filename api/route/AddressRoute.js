const express = require('express');
const AddressController = require('../controller/address_view');
const router = express.Router();


router.get('/all', AddressController.getAllAddresses);
router.get('/:id', AddressController.getAddressById);
router.post('/', AddressController.createAddress);
router.put('/:id/update', AddressController.updateAddress);
router.delete('/:id/delete', AddressController.deleteAddress);

module.exports = router;
