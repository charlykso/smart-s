const mongoose = require('mongoose')

const groupSchoolSchema = new mongoose.Schema({
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
        unique: true,
    },

  
},{ timestamps: true });

module.exports = mongoose.model('GroupSchool', groupSchoolSchema)