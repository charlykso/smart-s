const mongoose = require('mongoose');

const paymentProfileSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        unique: true
    },
    fw_secret_key: {
        type: String,
        trim: true,
        default: null,
    },
    activate_fw: {
        type: Boolean,
        default: false
    },
    ps_secret_key: {
        type: String,
        trim: true,
        default: null,
    },
    activate_ps: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true })

module.exports = mongoose.model('PaymentProfile', paymentProfileSchema);