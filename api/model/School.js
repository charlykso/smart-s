const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    groupSchool:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupSchool',
    },

    name:{
        type: String,
        require: true,
        unique: true,
    },

    address:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },

    email:{
        type: String,
        require: true,
        unique: true,
    },

    phoneNumber:{
        type: String,
        require: true,
        unique: true,
    },

    isActive:{
        type: Boolean,
        default: true,
        require: true,
    },

}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);