const express = require('express')
const feeController = require('../controller/fee_view')
const authenticateToken = require('../middleware/authenticateToken')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()

router.get('/all', feeController.getFees)
router.route('/get-approved-fees')
 .get(authenticateToken, verifyRoles(roleList.bursar, roleList.principal, roleList.admin), feeController.getApprovedFees) //Bursar and principal
router.route('/get-unapproved-fees')
 .get(authenticateToken, verifyRoles(roleList.bursar, roleList.principal, roleList.admin), feeController.getUnapprovedFees) //Bursar and principal

router.get('/:id', feeController.getFee)

router.post('/create', feeController.createFee) //Bursar
 
router.route('/:id/update')
 .put(authenticateToken, verifyRoles(roleList.bursar, roleList.admin), feeController.updateFee) //Bursar
router.route('/:id/delete')
 .delete(authenticateToken, verifyRoles(roleList.bursar, roleList.admin), feeController.deleteFee) //Bursar

router.get('/term/:term_id', feeController.getFeesByTerm)

router.route('/:term_id/get-approved-fees')
 .get(authenticateToken, verifyRoles(roleList.bursar, roleList.principal, roleList.admin), feeController.getApprovedFeesByTerm)

router.route('/:term_id/get-unapproved-fees')
 .get(authenticateToken, verifyRoles(roleList.bursar, roleList.principal, roleList.admin), feeController.getUnapprovedFeesByTerm)

router
  .route('/school/school_id')
  .get(
    feeController.approvedFeesForASchool
  ) //Bursar and principal

router.route('/school/school_id')
 .get(authenticateToken, verifyRoles(roleList.bursar, roleList.principal, roleList.admin), feeController.getFeesBySchool)
module.exports = router
