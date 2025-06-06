const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    name: { 
        type: String,
        required: true,
        },
    startDate: { 
        type: Date,
        required: true ,
        },
    endDate: { 
        type: Date, 
        required: true,
     },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
