const express = require('express');
const paymentProfileController = require('../controller/paymentProfile_view');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles')

router.route('/all')
    .get(authenticateToken, verifyRoles(roleList.admin), paymentProfileController.getAllPaymentProfiles)
router.route('/:id')
    .get(authenticateToken, verifyRoles(roleList.admin, roleList.auditor, roleList.principal), paymentProfileController.getPaymentProfile)
router.route('/all/:school_id')
    .get(authenticateToken, verifyRoles(roleList.admin, roleList.auditor, roleList.principal, roleList.ICT_administrator), paymentProfileController.getAllPaymentProfilesForSchool)
router.route('/create')
    .post(authenticateToken, verifyRoles(roleList.admin, roleList.auditor), paymentProfileController.createPaymentProfile)
router.route('/update/:id')
    .put(authenticateToken, verifyRoles(roleList.admin, roleList.auditor), paymentProfileController.updatePaymentProfile)
router.route('/delete/:id')
    .delete(authenticateToken, verifyRoles(roleList.admin, roleList.auditor), paymentProfileController.deletePaymentProfile)

module.exports = router;