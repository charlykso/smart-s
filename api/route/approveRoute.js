const express = require('express')
const FeeController = require('../controller/approve_view')
const authenticateToken = require('../middleware/authenticateToken')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()

router.route('/:fee_id/approve')
    .put(authenticateToken, verifyRoles(roleList.principal), FeeController.approveFee) //Principal

module.exports = router