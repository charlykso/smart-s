const PaymentProfile = require('../model/PaymentProfile');
const axios = require('axios');
const genTrxnRef = require('./genTrxnRef')
const { combine, getKey, getCypherText,  decrypt } = require('./security')

const initiatePaymentWithPaystack = async ( paymentProfile, fee, userData, callbackUrl) => {
    const cypherText = combine(paymentProfile.ps_secret_key)
    const url = callbackUrl + '?key=' + cypherText
    const paymentData = {
        email: userData.email,
        amount: fee.amount * 100, // Paystack requires the amount in kobo
        currency: "NGN",
        callback_url: url,
        trxref: genTrxnRef(),
        metadata: {
            custom_fields: [
                {
                    display_name: "Payment for",
                    variable_name: "payment_for",
                    user_id:  userData._id,
                    regNo: userData.regNo,
                    fee_id: fee._id,
                    value: fee.name
                }
            ]
        }
    };

    const headers = {
        Authorization: `Bearer ${paymentProfile.ps_secret_key}`,
        "Content-Type": "application/json"
    };
    const options = {
        method: 'POST',
        url: 'https://api.paystack.co/transaction/initialize',
        headers,
        data: paymentData
    };
    const response = await axios(options);
    if (response.status === 200) {
        return response.data.data.authorization_url;
    } else {
        throw new Error('Failed to initiate payment');
    }
}

const paystackCallback = async (reference, key) => {
    const cypherText = getCypherText(key)
    const enc_key = getKey(key)
    const plainText = decrypt(cypherText, enc_key)
    const headers = {
      Authorization: `Bearer ${plainText}`,
      'Content-Type': 'application/json',
    }
    const options = {
        method: 'GET',
        url: `https://api.paystack.co/transaction/verify/${reference}`,
        headers
    };
    const response = await axios(options);
    if (response.status === 200) {
        return response.data.data;
    } else {
        throw new Error('Failed to verify payment');
    }
}

module.exports = {
  initiatePaymentWithPaystack,
    paystackCallback
}