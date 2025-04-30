const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    groupSchoold:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupSchool',
    },

    schoolName:{
        type: String,
        require: true,
        unique: true,
    },

    addressId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },

    email:{
        type: String,
        require: true,
        unique: true,
    },

    phoneNumber:{
        type: Number,
        require: true,
        unique: true,
    },

    isActive:{
        type: Boolean,
        default: true,
        require: true,
    },

}, { timestamps: true });

module.exports = mongoose.model('School', SchoolSchema);