const Payment = require('../model/Payment')

const mapPaystackPaymentData = async (data) => {
    const {
      id,
      amount,
      status,
      reference,
      channel,
      paid_at
    } = data
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

module.exports = {
    mapPaystackPaymentData,
}