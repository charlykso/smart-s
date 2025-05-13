const express = require('express')
const feeController = require('../controller/fee_view')
const authenticateToken = require('../middleware/authenticateToken')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()

router.get('/all', feeController.getFees)
router.get('/:id', feeController.getFee)
router.route('/create')
 .post(authenticateToken, verifyRoles(roleList.bursar), feeController.createFee) //Bursar
router.route('/:id/update')
 .put(authenticateToken, verifyRoles(roleList.bursar), feeController.updateFee) //Bursar
router.route('/:id/delete')
 .delete(authenticateToken, verifyRoles(roleList.bursar), feeController.deleteFee) //Bursar
router.get('/term/termId', feeController.getFeesByTerm) 

module.exports = router