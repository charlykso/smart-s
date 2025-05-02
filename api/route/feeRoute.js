const express = require('express')
const FeeController = require('../controller/fee_view')
const router = express.Router()

router.get('/all', FeeController.getFees)
router.get('/:id', FeeController.getFee)
router.post('/create', FeeController.createFee)
router.put('/:id/update', FeeController.updateFee)
router.delete('/:id/delete', FeeController.deleteFee)
router.get('/term/termId', FeeController.getFeesByTerm)

module.exports = router