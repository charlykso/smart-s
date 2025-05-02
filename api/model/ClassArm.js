const mongoose = require('mongoose');

const ClassArmSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    totalNumberOfStudents: {
        type: Number,
        require: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('ClassArm', ClassArmSchema);
