const User = require('../model/User')
const bcrypt = require('bcryptjs')
const authenticateUser = require('../helpers/authenticateUser')
const generateToken = require('../helpers/generateToken')

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const user = await authenticateUser(email, password)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const token = generateToken(user)

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          id: user._id, // Add id field for frontend compatibility
          email: user.email,
          firstname: user.firstname,
          middlename: user.middlename,
          lastname: user.lastname,
          regNo: user.regNo,
          phone: user.phone,
          roles: user.roles,
          type: user.type,
          gender: user.gender,
          school: user.school,
          classArm: user.classArm,
          profile: user.profile,
          isActive: user.isActive !== false, // Default to true if not set
          status: user.isActive !== false ? 'active' : 'inactive',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token: token.authToken,
        refreshToken: token.refreshToken,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

exports.logout = async (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    })

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
