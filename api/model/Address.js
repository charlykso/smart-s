const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    country: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    town: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    zip_code: {
        type: Number,
        required: true,
    },
    street_no: {
        type: Number,
        required: true,
    },

}, { timestamps: true });

module.exports = mongoose.model('Address', AddressSchema);
