const express = require('express')
const FeeController = require('../controller/fee_view')
const authenticateToken = require('../middleware/authenticateToken')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()

router.get('/all', FeeController.getFees)
router.get('/:id', FeeController.getFee)
router.route('/create')
 .post(authenticateToken, verifyRoles(roleList.bursar), FeeController.createFee) //Bursar
router.route('/:id/update')
 .put(authenticateToken, verifyRoles(roleList.bursar), FeeController.updateFee) //Bursar
router.route('/:id/delete')
 .delete(authenticateToken, verifyRoles(roleList.bursar), FeeController.deleteFee) //Bursar
router.get('/term/termId', FeeController.getFeesByTerm) 

module.exports = router