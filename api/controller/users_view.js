const User = require('../model/User')
const School = require('../model/School')
const ClassArm = require('../model/ClassArm')
const Address = require('../model/Address')
const Profile = require('../model/Profile')
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -__v').populate('school', 'name').populate('classArm', 'name').populate('address', 'country state zip_code town street street_no').populate('profile', 'dateOfAdmission img graduationYear')
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getUser = async (req, res) =>{
    try{
        const user = await User.findById(req.params.id).populate('school', 'name').populate('classArm', 'name').populate('address', 'country state zip_code town street street_no').populate('profile', 'user img graduationYear dateOfAdmission')
        if (!user) return res.status(404).json({message: 'User not found'})
        res.json(user)

    }catch(error){
        res.status(500).json({ message: error.message });
    }
}

exports.createUser = async (req, res) => {
    try{
        const {email, password} = req.body
        const existingUser = await User.findOne({$or: [{email}]})
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User ({
            school: req.body.school_id,
            firstname: req.body.firstname,
            middlename: req.body.middlename,
            lastname: req.body.lastname,
            regNo: req.body.regNo,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address_id,
            student: req.body.student_id,
            DOB: req.body.DOB,
            gender: req.body.gender,
            classArm: req.body.classArm_id,
            type: req.body.type,
            roles: req.body.roles,
            password: hashedPassword,
        })
        await user.save()
        const profile = new Profile ({
            user: user._id,
            img: req.body.img,
            graduationYear: req.body.graduationYear,
            dateOfAdmission: req.body.dateOfAdmission,
        })
        await profile.save()
        res.status(201).json({message:'user and profile created', user, profile})
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}

exports.updateUser = async (req, res) =>{
    try{
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({ message: 'User not found'})
        
        user.school = req.body.school_id
        user.firstname = req.body.firstname
        user.middlename = req.body.middlename
        user.lastname = req.body.lastname
        user.regNo = req.body.regNo
        user.email = req.body.email
        user.phone = req.body.phone
        user.address = req.body.address_id
        user.student = req.body.student_id
        user.DOB = req.body.DOB
        user.gender = req.body.gender
        user.classArm = req.body.classArm_id
        user.type = req.body.type
        user.roles = req.body.roles
    const updatedUser = await user.save()
    res.status(200).json(updatedUser)

    }catch (error) {
        res.status(400).json({ message: error.message })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json({ message: 'User not found' })
        await User.findByIdAndDelete({ _id: req.params.id })
        res.status(200).json({ message: 'User deleted successfully' })
      } catch (error) {
        res.status(500).json({ message: error.message })
      }
}
