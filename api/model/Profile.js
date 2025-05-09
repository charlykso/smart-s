const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
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
        trim: true
    },
    passwordRest_token: {
        type: String,
    },
    refresh_token: {
        type: String,
    },
}, { timestamps: true })

module.exports = mongoose.model('Profile', profileSchema)