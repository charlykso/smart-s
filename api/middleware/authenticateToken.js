require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('../model/User')

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Fetch full user data including school information
    const user = await User.findById(decoded.id)
      .populate('school', 'name _id')
      .select('-password')

    if (!user) {
      return res.status(403).json({ message: 'User not found' })
    }

    // Enhanced school validation: ensure token school matches database school
    const tokenSchool = decoded.school
    const userSchool = user.school?._id || user.school

    // For users with school assignments, validate consistency
    if (tokenSchool || userSchool) {
      const tokenSchoolId = tokenSchool ? tokenSchool.toString() : null
      const userSchoolId = userSchool ? userSchool.toString() : null

      if (tokenSchoolId !== userSchoolId) {
        console.warn('School mismatch detected:', {
          userId: user._id,
          email: user.email,
          tokenSchool: tokenSchoolId,
          userSchool: userSchoolId,
        })
        return res.status(403).json({
          message: 'School assignment mismatch. Please login again.',
        })
      }
    }

    req.roles = decoded.roles
    req.user = user
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

module.exports = authenticateToken
