const PaymentProfile = require('../model/PaymentProfile');
const axios = require('axios');
const genTrxnRef = require('./genTrxnRef');
const { combine, getKey, getCypherText, decrypt } = require('./security');

const initiatePaymentWithFlutterwave = async (paymentProfile, fee, userData, callbackUrl) => {
    try {
        const cypherText = combine(paymentProfile.fw_secret_key);
        const url = callbackUrl + '?key=' + cypherText;
        const tRef = genTrxnRef();
        
        const paymentData = {
            tx_ref: tRef,
            amount: fee.amount,
            currency: 'NGN',
            redirect_url: url,
            customer: {
                email: userData.email,
                phonenumber: userData.phone || '',
                name: `${userData.firstname} ${userData.lastname}`,
                user_id: userData._id
            },
            customizations: {
                title: 'Smart-S School Fee Payment',
                description: `Payment for ${fee.name}`,
                logo: 'https://smart-s.com/logo.png'
            },
            meta: {
                user_id: userData._id,
                regNo: userData.regNo,
                fee_id: fee._id,
                fee_name: fee.name,
                trxref: tRef,
                payment_for: fee.name
            }
        };

        const headers = {
            Authorization: `Bearer ${paymentProfile.fw_secret_key}`,
            'Content-Type': 'application/json'
        };

        const options = {
            method: 'POST',
            url: 'https://api.flutterwave.com/v3/payments',
            headers,
            data: paymentData
        };

        const response = await axios(options);
        
        if (response.status === 200 && response.data.status === 'success') {
            return response.data.data.link;
        } else {
            throw new Error(response.data.message || 'Failed to initiate Flutterwave payment');
        }
    } catch (error) {
        console.error('Flutterwave payment initiation error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to initiate payment');
    }
};

const flutterwaveCallback = async (transaction_id, key) => {
    try {
        const cypherText = getCypherText(key);
        const enc_key = getKey(key);
        const plainText = decrypt(cypherText, enc_key);
        
        const headers = {
            Authorization: `Bearer ${plainText}`,
            'Content-Type': 'application/json'
        };

        const options = {
            method: 'GET',
            url: `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
            headers
        };

        const response = await axios(options);
        
        if (response.status === 200 && response.data.status === 'success') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to verify Flutterwave payment');
        }
    } catch (error) {
        console.error('Flutterwave payment verification error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to verify payment');
    }
};

const verifyFlutterwaveTransaction = async (tx_ref, secret_key) => {
    try {
        const headers = {
            Authorization: `Bearer ${secret_key}`,
            'Content-Type': 'application/json'
        };

        const options = {
            method: 'GET',
            url: `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`,
            headers
        };

        const response = await axios(options);
        
        if (response.status === 200 && response.data.status === 'success') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to verify transaction');
        }
    } catch (error) {
        console.error('Flutterwave transaction verification error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to verify transaction');
    }
};

const getFlutterwaveTransactionStatus = async (transaction_id, secret_key) => {
    try {
        const headers = {
            Authorization: `Bearer ${secret_key}`,
            'Content-Type': 'application/json'
        };

        const options = {
            method: 'GET',
            url: `https://api.flutterwave.com/v3/transactions/${transaction_id}`,
            headers
        };

        const response = await axios(options);
        
        if (response.status === 200 && response.data.status === 'success') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to get transaction status');
        }
    } catch (error) {
        console.error('Flutterwave transaction status error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to get transaction status');
    }
};

const refundFlutterwaveTransaction = async (transaction_id, amount, secret_key) => {
    try {
        const headers = {
            Authorization: `Bearer ${secret_key}`,
            'Content-Type': 'application/json'
        };

        const refundData = {
            amount: amount
        };

        const options = {
            method: 'POST',
            url: `https://api.flutterwave.com/v3/transactions/${transaction_id}/refund`,
            headers,
            data: refundData
        };

        const response = await axios(options);
        
        if (response.status === 200 && response.data.status === 'success') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to process refund');
        }
    } catch (error) {
        console.error('Flutterwave refund error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to process refund');
    }
};

const getFlutterwavePaymentMethods = async (secret_key) => {
    try {
        const headers = {
            Authorization: `Bearer ${secret_key}`,
            'Content-Type': 'application/json'
        };

        const options = {
            method: 'GET',
            url: 'https://api.flutterwave.com/v3/payment-methods',
            headers
        };

        const response = await axios(options);
        
        if (response.status === 200 && response.data.status === 'success') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to get payment methods');
        }
    } catch (error) {
        console.error('Flutterwave payment methods error:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to get payment methods');
    }
};

// Webhook signature verification
const verifyFlutterwaveWebhook = (payload, signature, secret_hash) => {
    try {
        const crypto = require('crypto');
        const hash = crypto.createHmac('sha256', secret_hash).update(payload).digest('hex');
        return hash === signature;
    } catch (error) {
        console.error('Webhook verification error:', error);
        return false;
    }
};

// Handle Flutterwave webhook events
const handleFlutterwaveWebhook = async (event, data) => {
    try {
        switch (event) {
            case 'charge.completed':
                // Handle successful payment
                console.log('Payment completed:', data);
                break;
            case 'charge.failed':
                // Handle failed payment
                console.log('Payment failed:', data);
                break;
            case 'transfer.completed':
                // Handle successful transfer
                console.log('Transfer completed:', data);
                break;
            case 'transfer.failed':
                // Handle failed transfer
                console.log('Transfer failed:', data);
                break;
            default:
                console.log('Unhandled webhook event:', event);
        }
    } catch (error) {
        console.error('Webhook handling error:', error);
        throw error;
    }
};

module.exports = {
    initiatePaymentWithFlutterwave,
    flutterwaveCallback,
    verifyFlutterwaveTransaction,
    getFlutterwaveTransactionStatus,
    refundFlutterwaveTransaction,
    getFlutterwavePaymentMethods,
    verifyFlutterwaveWebhook,
    handleFlutterwaveWebhook
};
