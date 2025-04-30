const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    country: String,
    state: String,
    street: String,
    zip_code: String,
    street_no: String
}, { timestamps: true });

module.exports = mongoose.model('Address', AddressSchema);
