const jwt = require('jsonwebtoken')
const User = require('../model/User')

// Authenticate token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).populate('school')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found',
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message,
    })
  }
}

// Authorize roles middleware
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        })
      }

      const userRoles = req.user.roles || []
      const hasPermission = allowedRoles.some((role) =>
        userRoles.includes(role)
      )

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: allowedRoles,
          current: userRoles,
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization failed',
        error: error.message,
      })
    }
  }
}

// Check if user has specific role
const hasRole = (user, role) => {
  return user && user.roles && user.roles.includes(role)
}

// Check if user has any of the specified roles
const hasAnyRole = (user, roles) => {
  return user && user.roles && roles.some((role) => user.roles.includes(role))
}

// Check if user has all of the specified roles
const hasAllRoles = (user, roles) => {
  return user && user.roles && roles.every((role) => user.roles.includes(role))
}

// Middleware to check if user belongs to specific school
const checkSchoolAccess = (req, res, next) => {
  try {
    const { school_id } = req.params
    const userSchool = req.user.school?._id || req.user.school
    const userRoles = req.user.roles || []

    // Only general Admin (not assigned to a school) can access all schools
    if (userRoles.includes('Admin') && !userSchool) {
      return next()
    }

    // All other users must have school access validation
    if (!userSchool) {
      return res.status(403).json({
        success: false,
        message: 'User must belong to a school to access this resource',
      })
    }

    // Check if user belongs to the requested school
    if (school_id && userSchool.toString() !== school_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - school mismatch',
      })
    }

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'School access check failed',
      error: error.message,
    })
  }
}

// Middleware to automatically filter data by user's school
const filterByUserSchool = (req, res, next) => {
  try {
    const userSchool = req.user.school?._id || req.user.school
    const userRoles = req.user.roles || []

    // Only general Admin can access all schools - no filtering needed
    if (userRoles.includes('Admin') && !userSchool) {
      return next()
    }

    // All users (including Admin assigned to a school) must have school filtering
    if (!userSchool) {
      return res.status(403).json({
        success: false,
        message: 'User must belong to a school to access this resource',
      })
    }

    // Add school filter to query for all users
    req.schoolFilter = { school: userSchool }
    req.userSchool = userSchool // Store for additional checks

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'School filtering failed',
      error: error.message,
    })
  }
}

// Middleware to ensure user can only access their own school's data
const enforceSchoolBoundary = (req, res, next) => {
  try {
    const userSchool = req.user.school?._id || req.user.school
    const userRoles = req.user.roles || []

    // Only general Admin (not assigned to a school) can access all schools
    if (userRoles.includes('Admin') && !userSchool) {
      return next()
    }

    // All other users (including Admin assigned to a school) must have school
    if (!userSchool) {
      return res.status(403).json({
        success: false,
        message: 'User must belong to a school to access this resource',
      })
    }

    // For students, they can only access their own data or their school's approved fees
    if (hasRole(req.user, 'Student')) {
      req.studentSchoolFilter = {
        school: userSchool.toString(),
        isApproved: true,
      }
    } else {
      // Other roles can access their school's data
      req.schoolFilter = { school: userSchool.toString() }
    }

    req.userSchool = userSchool // Store for additional checks

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'School boundary enforcement failed',
      error: error.message,
    })
  }
}

// Middleware to validate user status
const validateUserStatus = (req, res, next) => {
  try {
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      })
    }

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'User status validation failed',
      error: error.message,
    })
  }
}

// Middleware to log user actions
const logUserAction = (action) => {
  return (req, res, next) => {
    try {
      console.log(
        `User Action: ${
          req.user.email
        } performed ${action} at ${new Date().toISOString()}`
      )
      next()
    } catch (error) {
      console.error('Action logging failed:', error)
      next() // Continue even if logging fails
    }
  }
}

// Middleware to validate school assignment for user creation/updates
const validateSchoolAssignment = (req, res, next) => {
  try {
    const userRoles = req.user.roles || []
    const userSchool = req.user.school?._id || req.user.school
    const { school_id, roles } = req.body
    const targetRoles = Array.isArray(roles) ? roles : [roles]

    // Only general Admin (not assigned to a school) can create users for any school
    if (userRoles.includes('Admin') && !userSchool) {
      // General Admin must specify a school for non-Admin users
      if (!targetRoles.includes('Admin') && !school_id) {
        return res.status(400).json({
          success: false,
          message: 'School assignment is required for non-Admin users',
        })
      }
      return next()
    }

    // All other users (including school-assigned Admins) can only create users for their school
    if (!userSchool) {
      return res.status(403).json({
        success: false,
        message: 'User must belong to a school to create other users',
      })
    }

    // Validate school assignment
    if (!school_id) {
      return res.status(400).json({
        success: false,
        message: 'School assignment is required',
      })
    }

    if (userSchool.toString() !== school_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - can only create users for your own school',
      })
    }

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'School assignment validation failed',
      error: error.message,
    })
  }
}

// Middleware to ensure only general Admins can access all users endpoint
const restrictGeneralAdminAccess = (req, res, next) => {
  try {
    const userRoles = req.user.roles || []
    const userSchool = req.user.school?._id || req.user.school

    // Only general Admin (not assigned to a school) can access this endpoint
    if (!userRoles.includes('Admin') || userSchool) {
      return res.status(403).json({
        success: false,
        message:
          'Access denied - only general administrators can access all users',
      })
    }

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'General admin access check failed',
      error: error.message,
    })
  }
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  checkSchoolAccess,
  filterByUserSchool,
  enforceSchoolBoundary,
  validateUserStatus,
  logUserAction,
  validateSchoolAssignment,
  restrictGeneralAdminAccess,
}
