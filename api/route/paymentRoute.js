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

module.exports = router;