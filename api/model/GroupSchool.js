const mongoose = require('mongoose')

const GroupSchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },

    description: {
        type: String,
        required: true,
    },

    logo: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('GroupSchool', GroupSchoolSchema)