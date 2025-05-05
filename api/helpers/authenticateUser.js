const User = require('../model/User');
const bcrypt = require('bcryptjs');

const authenticateUser = async (email, password) => {
    try {
        const initial_user = await User.findOne({ email: email });
        if (!initial_user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, initial_user.password);
        if (isMatch) {
            return initial_user
        }
        throw new Error('Invalid credentials');
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = authenticateUser;