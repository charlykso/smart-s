const Payment = require('../model/Payment')
const PaymentProfile = require('../model/PaymentProfile')
const Fee = require('../model/Fee')
const User = require('../model/User')
const {
  initiatePaymentWithPaystack,
  paystackCallback,
} = require('../helpers/payWithPaystack')

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user, regNo email')
      .populate('fee, name amount')
    res.status(200).json(payments)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.initiatePayment = async (req, res) => {
  try {
    const { user_id, fee_id, school_id } = req.body
    const fee = await Fee.findById(fee_id)
    if (!fee) return res.status(404).json({ error: 'Fee not found' })
    const user = await User.findById(user_id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const paymentProfile = await PaymentProfile.findOne({ school: school_id })
    if (!paymentProfile)
      return res.status(404).json({ error: 'Payment profile not found' })

    if (paymentProfile.activate_ps) {
      const callbackUrl = `http://localhost:3000/api/v1/payment/paystack_callback`
      const paymentUrl = await initiatePaymentWithPaystack(
        paymentProfile,
        fee,
        user,
        callbackUrl
      )
      return res.status(200).json({ message: 'Payment initiated', paymentUrl })
    }
    if (paymentProfile.activate_fw) {
      // Handle Flutterwave payment initiation here
      return res
        .status(200)
        .json({ message: 'Flutterwave payment initiation not implemented yet' })
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.paystackCallback = async (req, res) => {
  try {
    const { reference, key } = req.query
    const response = await paystackCallback(reference, key)
    if (response.status !== 'success') {
      return res.status(400).json({ error: 'Payment verification failed' })
    }
    // extract payment details from the response
    console.log(response)
    //insert payment record into the database
    res.status(200).json({res: response})
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}
