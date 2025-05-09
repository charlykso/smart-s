const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    term:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Term',
    },

    name:{
        type: String,
        require: true,
    },

    decription:{
        type: String,
        require: true,
    },

    type:{
        type: String,
        require: true,
    },

    isActive:{
        type: Boolean,
        default: true,
    },

    isInstallmentAllowed:{
        type: Boolean,
        default: false,
        require: true,
    },

    no_ofInstallments:{
        type: Number,
        default: 1,
        require: true,
    },

    amount:{
        type: mongoose.Schema.Types.Double,
        require: true,
    },

    isApproved:{
        type: Boolean,
        default: false,
    },

},{ timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
