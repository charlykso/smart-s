const express = require('express')
const FeeController = require('../controller/approve_view')
const router = express.Router()

router.put('/:fee_id/approve', FeeController.approveFee)

module.exports = router