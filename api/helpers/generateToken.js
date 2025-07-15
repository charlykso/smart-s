const jwt = require('jsonwebtoken')
require('dotenv').config()

const getAuthToken = (user) => {
  if (!(user?.['_id'] && user?.roles)) {
    throw new Error('Invalid user data')
  }

  // Include school information in token for better access control
  const tokenPayload = {
    id: user._id,
    roles: user.roles,
    iat: Math.floor(Date.now() / 1000),
  }

  // Add school information if user has a school assigned
  if (user.school) {
    tokenPayload.school = user.school._id || user.school
    tokenPayload.schoolName = user.school.name || 'Unknown School'
  }

  return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: '10h',
  })
}

const getRefreshToken = (user) => {
  // Include school information in refresh token as well
  const tokenPayload = {
    id: user._id,
    roles: user.roles,
    iat: Math.floor(Date.now() / 1000),
  }

  // Add school information if user has a school assigned
  if (user.school) {
    tokenPayload.school = user.school._id || user.school
    tokenPayload.schoolName = user.school.name || 'Unknown School'
  }

  return jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '5d',
  })
}

const generateToken = (user) => {
  const authToken = getAuthToken(user)
  const refreshToken = getRefreshToken(user)
  return { authToken, refreshToken }
}

module.exports = generateToken
