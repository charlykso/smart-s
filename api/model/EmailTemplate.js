const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['payment_reminder', 'payment_overdue', 'payment_success', 'payment_failed', 'fee_approved', 'system_notification'],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    htmlContent: {
        type: String,
        required: true
    },
    textContent: {
        type: String,
        required: true
    },
    variables: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    }
}, { timestamps: true });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
