const User = require('../model/User')
const bcrypt = require('bcryptjs')
const authenticateUser = require('../helpers/')
const generateToken = require('../helpers/')
exports.login = async(req, res) => {
    try{
        const {email, password} = req.body
        const user = await authenticateUser(email, password)
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
                lastname: user.lastname,
                regNo: user.regNo,
               level : user.level,
               staffNo: user.staffNo,
               title: user.title,
                gender: user.gender,
                roles: user.roles
            },
            message : "Successful",
            token : token.token,
        })
    
    }catch (err){
        res.status(500).json ({message: err.message})
    }
}
