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
router.get('/get-paystack', paymentController.getAllPaymentsByPaystack);
router.get('/get-Bank_transfer', paymentController.getAllPaymentsByBankTransfer);
router.route('/paystack_callback').get(paymentController.paystackCallback); 

router.route('/paystack_callback').get(paymentController.paystackCallback)
router.route('/pay-with-cash').post(
    authenticateToken,
    verifyRoles(roleList.Student, roleList.Admin),
    paymentController.PayWithCash
);

router.route('/get-payments-by-cash').get(
    authenticateToken,
    verifyRoles(roleList.Admin, roleList.Bursar),
    paymentController.getPaymentsByCash
);

router.route('/get-payments-by-flutterwave').get(
    authenticateToken,
    verifyRoles(roleList.Admin, roleList.Bursar),
    paymentController.getPaymentsByFlutterwave
);

module.exports = router;