const Payment = require('../model/Payment')

const mapPaystackPaymentData = async (data) => {
  const { id, amount, status, reference, channel, paid_at } = data
  const { user_id, fee_id } = data.metadata.custom_fields[0]
  const initialPaymet = await Payment.findOne({ user: user_id, fee: fee_id })
  if (initialPaymet) {
    // console.log('Payment already exists:', initialPaymet)
    throw new Error('Payment already exists')
  }
  const payment = new Payment({
    user: user_id,
    fee: fee_id,
    trans_id: id.toString(),
    trx_ref: reference,
    amount: amount / 100, // Convert to original amount
    mode_of_payment: 'paystack',
    status,
    isInstallment: false,
    channel,
    paid_at: paid_at,
  })
  // console.log('Payment data mapped:', payment)
  const savedPayment = await payment.save()
  if (!savedPayment) {
    throw new Error('Failed to save payment data')
  }
  return savedPayment
}

const mapFlutterwavePaymentData = async (data) => {
  const { id, amount, status, tx_ref, payment_type, created_at } = data

  const { user_id, fee_id } = data.meta
  const initialPayment = await Payment.findOne({ user: user_id, fee: fee_id })

  if (initialPayment) {
    throw new Error('Payment already exists')
  }

  // Map Flutterwave status to our status
  let paymentStatus = 'pending'
  if (status === 'successful') {
    paymentStatus = 'success'
  } else if (status === 'failed' || status === 'cancelled') {
    paymentStatus = 'failed'
  }

  const payment = new Payment({
    user: user_id,
    fee: fee_id,
    trans_id: id.toString(),
    trx_ref: tx_ref,
    amount: amount,
    mode_of_payment: 'flutterwave',
    status: paymentStatus,
    isInstallment: false,
    channel: payment_type || 'web',
    paid_at: status === 'successful' ? new Date(created_at) : null,
  })

  const savedPayment = await payment.save()
  if (!savedPayment) {
    throw new Error('Failed to save payment data')
  }
  return savedPayment
}

module.exports = {
  mapPaystackPaymentData,
  mapFlutterwavePaymentData,
}
