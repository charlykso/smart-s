const paymentController = require('../controller/payment_view')
const express = require('express')
const router = express.Router()
const authenticateToken = require('../middleware/authenticateToken')
const { filterByUserSchool } = require('../middleware/auth')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')

router
  .route('/all')
  .get(authenticateToken, filterByUserSchool, paymentController.getAllPayments)
router.route('/initiate').post(paymentController.initiatePayment)
router.get('/get-paystack', paymentController.getAllPaymentsByPaystack)
router.get('/get-Bank_transfer', paymentController.getAllPaymentsByBankTransfer)
router.get(
  '/get-payments-by-flutterwave',
  paymentController.getPaymentsByFlutterwave
)
router.get(
  '/available-methods/:school_id',
  paymentController.getAvailablePaymentMethods
)
router.route('/paystack_callback').get(paymentController.paystackCallback)
router.route('/flutterwave_callback').get(paymentController.flutterwaveCallback)
router
  .route('/pay-with-cash')
  .post(
    authenticateToken,
    verifyRoles(roleList.Student, roleList.Admin),
    paymentController.PayWithCash
  )

router
  .route('/get-payments-by-cash')
  .get(
    authenticateToken,
    verifyRoles(roleList.Admin, roleList.Bursar),
    paymentController.getPaymentsByCash
  )

router
  .route('/get-payments-by-flutterwave')
  .get(
    authenticateToken,
    verifyRoles(roleList.Admin, roleList.Bursar),
    paymentController.getPaymentsByFlutterwave
  )

// Student-specific endpoint to get their own payments
router
  .route('/student/my-payments')
  .get(
    authenticateToken,
    verifyRoles(roleList.Student),
    paymentController.getStudentPayments
  )

module.exports = router
