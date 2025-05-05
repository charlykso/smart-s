const mongoose = require('mongoose');

const ClassArmSchema = new mongoose.Schema({
    
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    totalNumberOfStudents: {
        type: Number,
    }
}, { timestamps: true });

module.exports = mongoose.model('ClassArm', ClassArmSchema);
