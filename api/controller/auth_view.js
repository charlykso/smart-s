const User = require('../model/User')
const bcrypt = require('bcryptjs')
const authenticateUser = require('../helpers/authenticateUser')
const generateToken = require('../helpers/generateToken')
exports.login = async(req, res) => {
    try{
        const {email, password} = req.body
        const user = await authenticateUser(email, password)
        if(!user) return res.status(404).json({message: "User not found"})
        const token = generateToken(user)
        res.cookie('refreshToken', token.refreshToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            samesite: 'None',
            maxAge: 7 * 24 * 60 * 1000,
        })
            res.status(200).json({
            user: {
              Id:  user._id,
              email: user.email,
               firstname : user.firstname,
                middlename: user.middlename,
                regNo: user.regNo,
               phone : user.phone,
               role: user.role,
               type: user.type,
                gender: user.gender,
                
            },
            message : "Successful",
            token : token.token,
        })
    
    }catch (err){
        res.status(500).json ({message: err.message})
    }
}
