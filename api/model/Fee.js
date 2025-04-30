const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
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
        require: true,
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
        type: Number,
        require: true,
    },

    isApproved:{
        type: Boolean,
        default: false,
        require: true,
    },

},{ timestamps: true });

module.exports = mongoose.model('Fees', FeeSchema);
