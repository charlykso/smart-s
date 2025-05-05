const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fee',
        required: true,
    },
    transaction_id: {
        type: String,
        required: true,
        unique: true,
    },
    trx_reference: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    transaction_date: {
        type: Date,
        default: Date.now,
    },
    mode_of_payment: {
        type: String,
        enum: ['paystack', 'flutterwave'],
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
    metadata: {
        type: Object, 
        default: {},
    },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);