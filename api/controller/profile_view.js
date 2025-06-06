const Profile = require('../model/Profile');
const User = require('../model/User');

exports.getAllUserProfile = async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.status(200).json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params.user_id;
        const profile = await Profile.findOne({ user: id }).populate('user', 'firstname middlename lastname email phone role');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createUserProfile = async (req, res) => {
    try {
        const { img, graduationYear, dateOfAdmission, passwordRest_token, refresh_token } = req.body

        const existingUserProfile = await User.findOne({ studentId, courseId });
        if (existingUserProfile) return res.status(400).json({ message: 'User profile already exist' })

        const profile = new Profile({ img, graduationYear, dateOfAdmission, passwordRest_token, refresh_token })
        await profile.save()

        res.status(201).json(profile)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

exports.updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params.user_id;
        const profile = await Profile.findOneAndUpdate({ user: id }, req.body, { new: true });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUserProfile = async (req, res) =>{
    try{
        const profile = await Profile.findByIdAndDelete(req.params.id)
        if (!profile) return res.status(404).json({message: 'Profile not found'})
        res.status(200).json({message: 'User profile deleted successfully'})
    }catch (error){
        res.status(500).json({message: error.message})
    }
}