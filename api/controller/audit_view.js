const Payment = require('../model/Payment')
const User = require('../model/User')
const Term = require('../model/Term')
const Session = require('../model/Session')
const Fee = require('../model/Fee')

exports.getAllPaymentsByUser = async (req, res) => {
  try {
    const user_id = req.params.user_id
    const user = await User.findById(user_id)
    if (!user) {
      return res.status(404).json({ error: 'User doesnt exist' })
    }
    const payments = await Payment.find({ user: user_id })
      .populate('user', 'email regNo')
      .populate('fee', 'name amount')

    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: 'No payments found for this user' })
    }

    res.status(200).json(payments)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.getAllPaymentByUserInTerm = async (req, res) => {
  try {
    const user_id = req.params.user_id
    const term_id = req.params.term_id
    const user = await User.findById(user_id)
    if (!user) {
      return res.status(404).json({ error: 'User doesnt exist' })
    }
    const term = await Term.findById(term_id)
    if (!term) {
      return res.status(404).json({ error: 'Term doesnt exist' })
    }
    
    // First find fees associated with this term
    const fees = await Fee.find({ term: term_id })
    if (!fees || fees.length === 0) {
      return res.status(404).json({ error: 'No fees found for this term' })
    }
    
    // Then find payments for these fees
    const feeIds = fees.map(fee => fee._id)
    const payments = await Payment.find({ 
      user: user_id, 
      fee: { $in: feeIds }
    })
      .populate('user', 'email regNo')
      .populate('fee', 'name amount')

    if (!payments || payments.length === 0) {
      return res
        .status(404)
        .json({ error: 'No payments found for this user in this term' })
    }

    res.status(200).json(payments)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}

exports.getAllPaymentByUserInSession = async (req, res) => {
  try {
    const user_id = req.params.user_id
    const session_id = req.params.session_id
    const user = await User.findById(user_id)
    if (!user) {
      return res.status(404).json({ error: 'User doesnt exist' })
    }
    const session = await Session.findById(session_id)
    if (!session) {
      return res.status(404).json({ error: 'Session doesnt exist' })
    }
    const payments = await Payment.find({ user: user_id, session: session_id })
      .populate('user', 'email regNo')
      .populate('fee', 'name amount')

    if (!payments || payments.length === 0) {
      return res
        .status(404)
        .json({ error: 'No payments found for this user in this session' })
    }

    res.status(200).json(payments)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message })
  }
}
