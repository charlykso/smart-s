const mongoose = require('mongoose');

const emailConfigSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        unique: true
    },
    provider: {
        type: String,
        enum: ['zoho', 'gmail', 'outlook'],
        default: 'zoho',
        required: true
    },
    host: {
        type: String,
        required: true,
        default: 'smtp.zoho.com'
    },
    port: {
        type: Number,
        required: true,
        default: 587
    },
    secure: {
        type: Boolean,
        default: false
    },
    auth: {
        user: {
            type: String,
            required: true
        },
        pass: {
            type: String,
            required: true
        }
    },
    from: {
        name: {
            type: String,
            required: true,
            default: 'Smart-S School'
        },
        email: {
            type: String,
            required: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastTested: {
        type: Date
    },
    testResult: {
        success: {
            type: Boolean
        },
        message: {
            type: String
        },
        testedAt: {
            type: Date
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('EmailConfig', emailConfigSchema);
