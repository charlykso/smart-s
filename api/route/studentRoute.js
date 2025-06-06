const express = require('express')
const studentController = require('../controller/student_view')
const authenticateToken = require('../middleware/authenticateToken')
const { enforceSchoolBoundary } = require('../middleware/auth')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')

const router = express.Router()

// Student dashboard data
router.get(
  '/dashboard',
  authenticateToken,
  verifyRoles(roleList.Student),
  studentController.getStudentDashboard
)

// Student payments history
router.get(
  '/payments',
  authenticateToken,
  verifyRoles(roleList.Student),
  studentController.getStudentPayments
)

// Student outstanding fees
router.get(
  '/outstanding-fees',
  authenticateToken,
  verifyRoles(roleList.Student),
  enforceSchoolBoundary,
  studentController.getStudentOutstandingFees
)

// Student academic summary
router.get(
  '/academic-summary',
  authenticateToken,
  verifyRoles(roleList.Student),
  studentController.getStudentAcademicSummary
)

module.exports = router
