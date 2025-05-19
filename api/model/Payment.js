const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fee',
        required: true,
    },
    trans_id: {
        type: mongoose.Schema.Types.BigInt,
    },
    trx_ref: {
        type: String,
    },
    amount: {
        type: mongoose.Schema.Types.Double,
        required: true,
        min: 0,
    },
    trans_date: {
        type: Date,
        default: Date.now,
    },
    mode_of_payment: {
        type: String,
        enum: ['paystack', 'flutterwave', 'bank_transfer', 'cash'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending',
    },
    isInstallment: {
        type: Boolean,
        default: false,
    },
    channel: {
        type: String,
        enum: ['web', 'mobile', 'pos', 'bank'],
        default: 'web',
    },
    paid_at: {
        type: Date,
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);