const express = require('express')
const schoolAccessController = require('../controller/school_access_controller')
const router = express.Router()
const authenticateToken = require('../middleware/authenticateToken')
const {
  restrictGeneralAdminAccess,
  filterByUserSchool,
} = require('../middleware/auth')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')

// Validate user school assignments (General Admin only)
router
  .route('/validate-assignments')
  .get(
    authenticateToken,
    verifyRoles(roleList.Admin),
    restrictGeneralAdminAccess,
    schoolAccessController.validateUserSchoolAssignments
  )

// Get users filtered by school
router
  .route('/users')
  .get(
    authenticateToken,
    verifyRoles(
      roleList.Admin,
      roleList.ICT_administrator,
      roleList.Proprietor,
      roleList.Principal
    ),
    schoolAccessController.getUsersBySchool
  )

module.exports = router
