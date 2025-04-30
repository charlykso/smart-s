const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    img: {
        type: String,
        trim: true
    },
    graduationYear: {
        type: Number,
        trim: true
    },
    dateOfAdmission: {
        type: String,
        required: true,
        trim: true
    },
    passwordRest_token: {
        type: String,
    },
    refresh_token: {
        type: String,
    },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)