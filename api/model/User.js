const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: School,
        required: true
    },
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    middlename: {
        type: String,
        required: true,
        trim: true
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
        lowercase: true,
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
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    DOB: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    classArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassArm'
    },
    type: {
        type: String,
        enum: ['admin', 'ICT_administrator', 'auditor', 'proprietor', 'principal', 'headteacher', 'bursar', 'student', 'parent'],
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'ICT_administrator', 'auditor', 'proprietor', 'principal', 'headteacher', 'bursar', 'student', 'parent'],
        required: true
    },
    password: {
        type: String,
        required: true
    },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)