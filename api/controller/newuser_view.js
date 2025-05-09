const User = require("../model/User");
const bcrypt = require("bcryptjs");
const Profile = require("../model/Profile");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -__v')
            .populate('school', 'name')
            .populate('classArm', 'name')
            .populate({
                path: Profile, 
            });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
