const express = require('express');
const paymentProfileController = require('../controller/paymentProfile_view');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles')

router.route('/all')
    .get(authenticateToken, verifyRoles(roleList.Admin), paymentProfileController.getAllPaymentProfiles)
router.route('/:id')
    .get(authenticateToken, verifyRoles(roleList.Admin, roleList.Auditor, roleList.Principal), paymentProfileController.getPaymentProfile)
router.route('/all/:school_id')
    .get(authenticateToken, verifyRoles(roleList.Admin, roleList.Auditor, roleList.Principal, roleList.ICT_administrator), paymentProfileController.getAllPaymentProfilesForSchool)
router.route('/create')
    .post(authenticateToken, verifyRoles(roleList.Admin, roleList.Auditor, roleList.Bursar), paymentProfileController.createPaymentProfile)
router.route('/update/:id')
    .put(authenticateToken, verifyRoles(roleList.Admin, roleList.Auditor), paymentProfileController.updatePaymentProfile)
router.route('/delete/:id')
    .delete(authenticateToken, verifyRoles(roleList.Admin, roleList.Auditor), paymentProfileController.deletePaymentProfile)

module.exports = router;