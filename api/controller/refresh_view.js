const jwt = require('jsonwebtoken')
const User = require('../model/User')
require('dotenv').config()

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies
    const refreshToken = cookies?.refreshToken || req.body.refreshToken

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided',
      })
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: 'Invalid refresh token',
          })
        }

        const user = await User.findById(decoded.id)
          .populate('school')
          .populate('classArm')
          .populate('profile')
          .exec()
        if (!user) {
          return res.status(403).json({
            success: false,
            message: 'User not found',
          })
        }

        const tokenPayload = {
          id: user._id,
          roles: user.roles,
          // include school details to keep parity with initial login tokens
          ...(user.school
            ? {
                school: user.school._id || user.school,
                schoolName: user.school.name || 'Unknown School',
              }
            : {}),
        }

        const newAccessToken = jwt.sign(
          tokenPayload,
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        )

        const newRefreshToken = jwt.sign(
          tokenPayload,
          process.env.JWT_REFRESH_SECRET,
          { expiresIn: '7d' }
        )

        // Set new refresh token as httpOnly cookie
        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'None',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        return res.status(200).json({
          success: true,
          message: 'Token refreshed successfully',
          data: {
            token: newAccessToken,
            refreshToken: newRefreshToken,
          },
        })
      }
    )
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

module.exports = { handleRefreshToken }
