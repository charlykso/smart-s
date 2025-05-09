const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
    },
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    middlename: {
        type: String,
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    regNo: {
        type: String,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    DOB: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    classArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassArm'
    },
    type: {
        type: String,
        enum: ['day', 'boarding'],
        default: 'day'
    },
    roles: {
        type: [String],
        enum: ['Admin', 'ICT_administrator', 'Auditor', 'Proprietor', 'Principal', 'Headteacher', 'Bursar', 'Student', 'Parent'],
        required: true,
        default: ['Student']
    },
    password: {
        type: String,
        required: true
    },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)