const User = require('../model/User')
const School = require('../model/School')

// Validate and fix user school assignments
exports.validateUserSchoolAssignments = async (req, res) => {
  try {
    const userRoles = req.user.roles || []

    // Only general Admin can run this validation
    if (!userRoles.includes('Admin') || req.user.school) {
      return res.status(403).json({
        success: false,
        message:
          'Access denied - only general administrators can validate user school assignments',
      })
    }

    const report = {
      totalUsers: 0,
      usersWithoutSchool: [],
      usersWithInvalidSchool: [],
      validAssignments: 0,
      fixedAssignments: 0,
    }

    // Get all users except general Admins
    const users = await User.find({
      $or: [
        { school: { $exists: false } },
        { school: null },
        { school: { $exists: true, $ne: null } },
      ],
    }).populate('school')

    report.totalUsers = users.length

    // Get all valid schools
    const validSchools = await School.find({}, '_id')
    const validSchoolIds = validSchools.map((school) => school._id.toString())

    for (const user of users) {
      const isGeneralAdmin = user.roles.includes('Admin') && !user.school

      // Skip general admins (they don't need school assignment)
      if (isGeneralAdmin) {
        continue
      }

      // Check if user has no school assignment
      if (!user.school) {
        report.usersWithoutSchool.push({
          _id: user._id,
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          roles: user.roles,
        })
        continue
      }

      // Check if user's school is valid
      const userSchoolId = user.school._id
        ? user.school._id.toString()
        : user.school.toString()
      if (!validSchoolIds.includes(userSchoolId)) {
        report.usersWithInvalidSchool.push({
          _id: user._id,
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          roles: user.roles,
          invalidSchoolId: userSchoolId,
        })
        continue
      }

      report.validAssignments++
    }

    res.status(200).json({
      success: true,
      data: report,
      message: 'User school assignment validation completed',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'School assignment validation failed',
      error: error.message,
    })
  }
}

// Get users filtered by current user's school
exports.getUsersBySchool = async (req, res) => {
  try {
    const userRoles = req.user.roles || []
    const userSchool = req.user.school?._id || req.user.school

    let query = {}

    // General Admin can see all users
    if (userRoles.includes('Admin') && !userSchool) {
      // No filter - return all users
    } else {
      // All other users can only see users from their school
      if (!userSchool) {
        return res.status(403).json({
          success: false,
          message: 'User must belong to a school to access this resource',
        })
      }
      query.school = userSchool
    }

    // Apply additional filters from query params
    const { role, status, search } = req.query

    if (role && role !== 'all') {
      query.roles = { $in: [role] }
    }

    if (status && status !== 'all') {
      query.status = status
    }

    let users = await User.find(query)
      .select('-password -__v')
      .populate('school', 'name')
      .populate('classArm', 'name')
      .populate('profile', 'img')
      .sort({ createdAt: -1 })

    // Apply search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i')
      users = users.filter(
        (user) =>
          searchRegex.test(user.firstname) ||
          searchRegex.test(user.lastname) ||
          searchRegex.test(user.email) ||
          searchRegex.test(user.regNo || '')
      )
    }

    res.status(200).json({
      success: true,
      data: {
        users,
        total: users.length,
        userSchool: userSchool ? userSchool.toString() : null,
        isGeneralAdmin: userRoles.includes('Admin') && !userSchool,
      },
      message: 'Users retrieved successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message,
    })
  }
}

// Enforce school assignment when creating users
const enforceSchoolAssignmentOnCreate = async (userData) => {
  const { school_id, roles } = userData
  const targetRoles = Array.isArray(roles) ? roles : [roles]

  // General Admin users don't need school assignment
  if (targetRoles.includes('Admin') && !school_id) {
    return userData
  }

  // All other users must have school assignment
  if (!school_id) {
    throw new Error('School assignment is required for non-Admin users')
  }

  // Validate that the school exists
  const school = await School.findById(school_id)
  if (!school) {
    throw new Error('Invalid school assignment - school not found')
  }

  return userData
}

module.exports = {
  validateUserSchoolAssignments: exports.validateUserSchoolAssignments,
  getUsersBySchool: exports.getUsersBySchool,
  enforceSchoolAssignmentOnCreate,
}
