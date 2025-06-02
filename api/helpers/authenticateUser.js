const User = require('../model/User')
const bcrypt = require('bcryptjs')

const authenticateUser = async (email, password) => {
  try {
    const initial_user = await User.findOne({ email: email })
      .populate('school')
      .populate('classArm')
      .populate('profile')
    if (!initial_user) {
      return null // Return null instead of trying to use res
    }
    const isMatch = await bcrypt.compare(password, initial_user.password)
    if (isMatch) {
      return initial_user
    }
    return null // Return null for invalid password
  } catch (err) {
    throw new Error(err.message)
  }
}

module.exports = authenticateUser
