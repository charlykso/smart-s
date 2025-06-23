const express = require('express')
const adminController = require('../controller/admin_view')
const authenticateToken = require('../middleware/authenticateToken')
const { authenticate, authorize } = require('../middleware/auth')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')

const router = express.Router()

// Admin dashboard data
router.get(
  '/dashboard',
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.getAdminDashboard
)

// System overview
router.get(
  '/system-overview',
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.getSystemOverview
)

// System activities
router.get(
  '/system-activities',
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.getSystemActivities
)

// User management
router.get(
  '/user-management',
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.getUserManagement
)

// Financial overview
router.get(
  '/financial-overview',
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.getFinancialOverview
)

// Create school under a group school
router.post(
  '/schools',
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.createSchool
)

// Create ICT Administrator for a school
router.post(
  '/ict-administrators',
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.createICTAdministrator
)

// Get all schools
router.get(
  '/schools',
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.getAllSchools
)

// Get all ICT administrators
router.get(
  '/ict-administrators',
  authenticateToken,
  verifyRoles(roleList.Admin),
  adminController.getAllICTAdministrators
)

module.exports = router
