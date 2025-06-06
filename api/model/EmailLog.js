const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    to: [{
        type: String,
        required: true
    }],
    cc: [{
        type: String
    }],
    bcc: [{
        type: String
    }],
    subject: {
        type: String,
        required: true
    },
    templateType: {
        type: String,
        enum: ['payment_reminder', 'payment_overdue', 'payment_success', 'payment_failed', 'fee_approved', 'system_notification']
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmailTemplate'
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'],
        default: 'sent'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'delivered', 'failed', 'bounced'],
        default: 'pending'
    },
    errorMessage: {
        type: String
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    deliveredAt: {
        type: Date
    },
    openedAt: {
        type: Date
    },
    clickedAt: {
        type: Date
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fee'
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

// Index for better query performance
emailLogSchema.index({ user: 1, sentAt: -1 });
emailLogSchema.index({ school: 1, sentAt: -1 });
emailLogSchema.index({ status: 1, sentAt: -1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
