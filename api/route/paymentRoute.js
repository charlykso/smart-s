const paymentController = require('../controller/payment_view');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles');

router.route('/all')
    .get( paymentController.getAllPayments);
router.route('/initiate')
    .post(paymentController.initiatePayment);

router.route('/paystack_callback').get(paymentController.paystackCallback)
router.route('/pay-with-cash').post(
    authenticateToken,
    verifyRoles(roleList.Student, roleList.Admin),
    paymentController.PayWithCash
);

module.exports = router;