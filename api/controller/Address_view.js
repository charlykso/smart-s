const Address = require('../models/Address'); // Import the Address model

// 🟢 Get All Addresses
exports.getAllAddresses = async (req, res) => {
    try {
        const addresses = await Address.find();
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔵 Get Address by ID
exports.getAddressById = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) return res.status(404).json({ message: "Address not found" });
        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Create New Address
exports.createAddress = async (req, res) => {
    try {
        const address = new Address(req.body);
        await address.save();
        res.status(201).json(address);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 🟠 Update Address by ID
exports.updateAddress = async (req, res) => {
    try {
        const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!address) return res.status(404).json({ message: "Address not found" });
        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔴 Delete Address by ID
exports.deleteAddress = async (req, res) => {
    try {
        const address = await Address.findByIdAndDelete(req.params.id);
        if (!address) return res.status(404).json({ message: "Address not found" });
        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = exports;
