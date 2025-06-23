const express = require('express')
const approveController = require('../controller/approve_view')
const authenticateToken = require('../middleware/authenticateToken')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()

router
  .route('/:fee_id/approve')
  .put(
    authenticateToken,
    verifyRoles(roleList.Principal, roleList.Admin),
    approveController.approveFee
  ) //Principal

router
  .route('/:fee_id/reject')
  .put(
    authenticateToken,
    verifyRoles(roleList.Principal, roleList.Admin),
    approveController.rejectFee
  ) //Principal

module.exports = router
