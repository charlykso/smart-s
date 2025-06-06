const express = require('express')
const AddressController = require('../controller/Address_view')
const router = express.Router()

router.route('/all', AddressController.getAllAddresses)
router.get('/:id', AddressController.getAddressById)
router.post('/', AddressController.createAddress)
router.put('/:id/update', AddressController.updateAddress)
router.delete('/:id/delete', AddressController.deleteAddress)

module.exports = router
