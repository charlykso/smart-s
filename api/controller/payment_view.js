const Payment = require('../model/Payment')
const PaymentProfile = require('../model/PaymentProfile')
const Fee = require('../model/Fee')
const User = require('../model/User')
const genTrxnRef = require('../helpers/genTrxnRef')
const {
  initiatePaymentWithPaystack,
  paystackCallback,
} = require('../helpers/payWithPaystack')
const {
  initiatePaymentWithFlutterwave,
  flutterwaveCallback,
} = require('../helpers/payWithFlutterwave')
const {
  mapPaystackPaymentData,
  mapFlutterwavePaymentData,
} = require('../helpers/mappPaymentData')

exports.getAllPayments = async (req, res) => {
  try {
    // Apply school filtering if user is not Admin
    if (req.schoolFilter) {
      // First get users that match the school filter
      const User = require('../model/User')
      const schoolUsers = await User.find(req.schoolFilter).select('_id')
      const userIds = schoolUsers.map((user) => user._id)

      // Then find payments for those users
      const payments = await Payment.find({ user: { $in: userIds } })
        .populate('user', 'email regNo school')
        .populate({
          path: 'fee',
          select: 'name amount school',
          populate: {
            path: 'school',
            select: 'name',
          },
        })
        .sort({ createdAt: -1 })

      return res.status(200).json(payments)
    }

    // Admin users get all payments
    const payments = await Payment.find()
      .populate('user', 'email regNo school')
      .populate({
        path: 'fee',
        select: 'name amount school',
        populate: {
          path: 'school',
          select: 'name',
        },
      })
      .sort({ createdAt: -1 })

    res.status(200).json(payments)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.initiatePayment = async (req, res) => {
  try {
    const { user_id, fee_id, school_id, payment_method } = req.body
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

    // Handle payment based on selected method
    switch (payment_method) {
      case 'paystack': {
        if (!paymentProfile.activate_ps) {
          return res
            .status(400)
            .json({ error: 'Paystack payment not available for this school' })
        }
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
        const paystackCallbackUrl = `${baseUrl}/api/v1/payment/paystack_callback`
        const paystackPaymentUrl = await initiatePaymentWithPaystack(
          paymentProfile,
          fee,
          user,
          paystackCallbackUrl
        )
        return res.status(200).json({
          message: 'Payment initiated with Paystack',
          paymentUrl: paystackPaymentUrl,
          payment_method: 'paystack',
        })
      }

      case 'flutterwave': {
        if (!paymentProfile.activate_fw) {
          return res.status(400).json({
            error: 'Flutterwave payment not available for this school',
          })
        }
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
        const flutterwaveCallbackUrl = `${baseUrl}/api/v1/payment/flutterwave_callback`
        const flutterwavePaymentUrl = await initiatePaymentWithFlutterwave(
          paymentProfile,
          fee,
          user,
          flutterwaveCallbackUrl
        )
        return res.status(200).json({
          message: 'Payment initiated with Flutterwave',
          paymentUrl: flutterwavePaymentUrl,
          payment_method: 'flutterwave',
        })
      }

      case 'bank_transfer':
        if (!paymentProfile.account_no || !paymentProfile.bank_name) {
          return res.status(400).json({
            error: 'Bank transfer details not available for this school',
          })
        }
        return res.status(200).json({
          message: 'Bank transfer details provided',
          payment_method: 'bank_transfer',
          bank_details: {
            account_no: paymentProfile.account_no,
            account_name: paymentProfile.account_name,
            bank_name: paymentProfile.bank_name,
            amount: fee.amount,
            reference: `${user.regNo}-${fee._id}-${Date.now()}`,
          },
        })

      default:
        // Fallback to automatic selection (existing behavior)
        if (paymentProfile.activate_ps) {
          const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
          const callbackUrl = `${baseUrl}/api/v1/payment/paystack_callback`
          const paymentUrl = await initiatePaymentWithPaystack(
            paymentProfile,
            fee,
            user,
            callbackUrl
          )
          return res
            .status(200)
            .json({ message: 'Payment initiated', paymentUrl })
        }
        if (paymentProfile.activate_fw) {
          const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
          const callbackUrl = `${baseUrl}/api/v1/payment/flutterwave_callback`
          const paymentUrl = await initiatePaymentWithFlutterwave(
            paymentProfile,
            fee,
            user,
            callbackUrl
          )
          return res
            .status(200)
            .json({ message: 'Payment initiated', paymentUrl })
        }
        return res.status(400).json({ error: 'No payment methods available' })
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
}

exports.flutterwaveCallback = async (req, res) => {
  try {
    const { transaction_id, key } = req.query
    const response = await flutterwaveCallback(transaction_id, key)
    if (response.status !== 'successful') {
      return res.status(400).json({ error: 'Payment verification failed' })
    }
    // extract payment details from the response
    console.log('Flutterwave response:', response)
    const paymentData = await mapFlutterwavePaymentData(response)
    //serialize the payment data
    console.log('Flutterwave payment data:', paymentData)
    //insert payment record into the database
    res.status(200).json({ res: 'Payment successful' })
  } catch (error) {
    console.error('Flutterwave callback error:', error)
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.getAllPaymentsByPaystack = async (req, res) => {
  try {
    const payments = await Payment.find({ mode_of_payment: 'paystack' })
      .populate('user', 'email regNo')
      .populate('fee', 'name amount')
    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: 'No paystack Payment found' })
    }
    res.status(200).json(payments)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}
exports.getAllPaymentsByBankTransfer = async (req, res) => {
  try {
    const payments = await Payment.find({ mode_of_payment: 'bank_transfer' })
      .populate('user', 'email regNo')
      .populate('fee', 'name amount')
    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: 'No bank_transfer Payment found' })
    }

    res.status(200).json(payments)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.PayWithCash = async (req, res) => {
  try {
    const { user_id, fee_id } = req.body

    // Validate required fields
    if (!user_id || !fee_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Fee ID are required',
      })
    }

    // Validate ObjectId format
    const mongoose = require('mongoose')
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format',
      })
    }
    if (!mongoose.Types.ObjectId.isValid(fee_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid fee ID format',
      })
    }

    const fee = await Fee.findById(fee_id)
    if (!fee)
      return res.status(404).json({
        success: false,
        error: 'Fee not found',
      })

    const user = await User.findById(user_id)
    if (!user)
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })

    const tRef = genTrxnRef()

    const initialPayment = await Payment.findOne({
      user: user_id,
      fee: fee_id,
    })
    if (initialPayment)
      return res.status(400).json({
        success: false,
        error: 'Payment already exists for this fee',
      })

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

    res.status(201).json({
      success: true,
      message: 'Payment successful',
      data: payment,
    })
  } catch (error) {
    console.error('Cash payment error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    })
  }
}

exports.getPaymentsByCash = async (req, res) => {
  try {
    const payments = await Payment.find({ mode_of_payment: 'cash' })
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
    const payments = await Payment.find({ mode_of_payment: 'flutterwave' })
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
}

// Get available payment methods for a school
exports.getAvailablePaymentMethods = async (req, res) => {
  try {
    const { school_id } = req.params
    const paymentProfile = await PaymentProfile.findOne({ school: school_id })

    if (!paymentProfile) {
      return res.status(404).json({ error: 'Payment profile not found' })
    }

    const availableMethods = []

    // Check Paystack
    if (paymentProfile.activate_ps && paymentProfile.ps_secret_key) {
      availableMethods.push({
        method: 'paystack',
        name: 'Paystack',
        description: 'Pay with card, bank transfer, or USSD',
        icon: 'credit-card',
        enabled: true,
      })
    }

    // Check Flutterwave
    if (paymentProfile.activate_fw && paymentProfile.fw_secret_key) {
      availableMethods.push({
        method: 'flutterwave',
        name: 'Flutterwave',
        description: 'Pay with card, bank transfer, or mobile money',
        icon: 'credit-card',
        enabled: true,
      })
    }

    // Check Bank Transfer
    if (paymentProfile.account_no && paymentProfile.bank_name) {
      availableMethods.push({
        method: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank transfer',
        icon: 'building-library',
        enabled: true,
        bank_details: {
          account_no: paymentProfile.account_no,
          account_name: paymentProfile.account_name,
          bank_name: paymentProfile.bank_name,
        },
      })
    }

    // Cash payment is always available
    availableMethods.push({
      method: 'cash',
      name: 'Cash Payment',
      description: 'Pay at the Bursar office',
      icon: 'banknotes',
      enabled: true,
    })

    res.status(200).json({
      success: true,
      data: availableMethods,
      total: availableMethods.length,
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    })
  }
}

// Get student's own payments
exports.getStudentPayments = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id

    const payments = await Payment.find({ user: studentId })
      .populate({
        path: 'fee',
        select: 'name amount type',
        populate: {
          path: 'term',
          select: 'name',
          populate: {
            path: 'session',
            select: 'name',
          },
        },
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: payments,
      total: payments.length,
      message: 'Student payments retrieved successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    })
  }
}
