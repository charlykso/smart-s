const Payment = require('../model/Payment')
const PaymentProfile = require('../model/PaymentProfile')
const Fee = require('../model/Fee')
const User = require('../model/User')
const genTrxnRef = require('../helpers/genTrxnRef')
const {
  initiatePaymentWithPaystack,
  paystackCallback,
} = require('../helpers/payWithPaystack')
const { mapPaystackPaymentData } = require('../helpers/mappPaymentData')

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('user', 'email regNo').populate('fee', 'name amount')
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
    const initialPayment = await Payment.findOne({
      user: user_id,
      fee: fee_id,
    })
    if (initialPayment)
      return res.status(400).json({ error: 'Payment already exists' })

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
    const paymentData = await mapPaystackPaymentData(response)
    //serialize the payment data
    console.log(paymentData)
    //insert payment record into the database
    res.status(200).json({ res: 'Payment successful' })
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
};
exports.getAllPaymentsByPaystack = async (req, res) => {
  try {
    const payments = await Payment.find({ mode_of_payment: 'paystack' })
      .populate('user', 'email regNo')
      .populate('fee', 'name amount')
    if (!payments || payments.length === 0){
      return res.status(404).json({error: 'No paystack Payment found'})
    }
    res.status(200).json(payments)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
};
exports.getAllPaymentsByBankTransfer = async (req, res) => {
  try {
    const payments = await Payment.find({ mode_of_payment: 'bank_transfer' })
      .populate('user', 'email regNo')
      .populate('fee', 'name amount')
    if (!payments || payments.length === 0){
      return res.status(404).json({error: 'No bank_transfer Payment found'})
    }

    res.status(200).json(payments)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
};



exports.PayWithCash = async (req, res) => {
  try {
    const { user_id, fee_id } = req.body
    const fee = await Fee.findById(fee_id)
    if (!fee) return res.status(404).json({ error: 'Fee not found' })
    const user = await User.findById(user_id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    
    const tRef = genTrxnRef()
    
    const initialPayment = await Payment.findOne({
      user: user_id,
      fee: fee_id,
    })
    if (initialPayment)
      return res.status(400).json({ error: 'Payment already exists' })

    const payment = new Payment({
      user: user_id,
      fee: fee_id,
      amount: fee.amount,
      mode_of_payment: 'cash',
      status: 'success',
      trx_ref: tRef,
      trans_date: new Date(),

    })
    await payment.save()
    res.status(201).json({ message: 'Payment successful', payment })

  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.getPaymentsByCash = async (req, res) => {
  try {
    const payments = await Payment.find({mode_of_payment: 'cash' })
      .populate('user', 'email regNo')
      .populate('fee', 'name amount')
    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: 'No cash payments found' })
    }
    res.status(200).json(payments)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.getPaymentsByFlutterwave = async (req, res) => {
  try {
    const payments = await Payment.find({mode_of_payment: 'flutterwave' })
      .populate('user', 'email regNo')
      .populate('fee', 'name amount')
    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: 'No Flutterwave payments found' })
    }
    res.status(200).json(payments)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
};
