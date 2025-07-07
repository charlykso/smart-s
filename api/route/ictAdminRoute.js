const express = require('express')
const router = express.Router()
const authenticateToken = require('../middleware/authenticateToken')
const verifyRoles = require('../middleware/verifyRoles')
const roleList = require('../helpers/roleList')
const User = require('../model/User')
const School = require('../model/School')
const Session = require('../model/Session')
const Term = require('../model/Term')
const Fee = require('../model/Fee')

// ICT Admin Dashboard - Get dashboard statistics
router.get(
  '/dashboard',
  authenticateToken,
  verifyRoles(roleList.ICT_administrator),
  async (req, res) => {
    try {
      const userSchoolId = req.user.school?._id || req.user.school

      if (!userSchoolId) {
        return res.status(400).json({
          success: false,
          message: 'School information not found for user',
        })
      }

      // Get school information
      const school = await School.findById(userSchoolId).populate('groupSchool')

      // Get basic statistics
      const stats = {
        totalStudents: await User.countDocuments({
          school: userSchoolId,
          roles: 'Student',
        }),
        totalSessions: await Session.countDocuments({
          school: userSchoolId,
        }),
        totalTerms: await Term.countDocuments({
          school: userSchoolId,
        }),
        totalFees: await Fee.countDocuments({
          school: userSchoolId,
        }),
      }

      // Get recent students (last 10)
      const recentStudents = await User.find({
        school: userSchoolId,
        roles: 'Student',
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('firstname lastname email regNo createdAt')

      // Get current sessions
      const currentSessions = await Session.find({
        school: userSchoolId,
      })
        .sort({ createdAt: -1 })
        .limit(5)

      // Get current terms
      const currentTerms = await Term.find({
        school: userSchoolId,
      })
        .sort({ createdAt: -1 })
        .limit(5)

      res.json({
        success: true,
        data: {
          school: {
            name: school.name,
            email: school.email,
            phoneNumber: school.phoneNumber,
            groupSchool: school.groupSchool,
          },
          stats,
          recentStudents,
          currentSessions,
          currentTerms,
        },
      })
    } catch (error) {
      console.error('ICT Admin Dashboard Error:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard data',
        error: error.message,
      })
    }
  }
)

// ICT Admin - Get all students for their school
router.get(
  '/students',
  authenticateToken,
  verifyRoles(roleList.ICT_administrator),
  async (req, res) => {
    try {
      const userSchoolId = req.user.school?._id || req.user.school

      if (!userSchoolId) {
        return res.status(400).json({
          success: false,
          message: 'School information not found for user',
        })
      }

      const students = await User.find({
        school: userSchoolId,
        roles: 'Student',
      })
        .populate('classArm', 'name')
        .select('firstname lastname email regNo phone gender DOB createdAt')
        .sort({ createdAt: -1 })

      res.json({
        success: true,
        data: students,
      })
    } catch (error) {
      console.error('ICT Admin Students Error:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching students data',
        error: error.message,
      })
    }
  }
)

// ICT Admin - Get sessions for their school
router.get(
  '/sessions',
  authenticateToken,
  verifyRoles(roleList.ICT_administrator),
  async (req, res) => {
    try {
      const userSchoolId = req.user.school?._id || req.user.school

      if (!userSchoolId) {
        return res.status(400).json({
          success: false,
          message: 'School information not found for user',
        })
      }

      const sessions = await Session.find({
        school: userSchoolId,
      }).sort({ createdAt: -1 })

      res.json({
        success: true,
        data: sessions,
      })
    } catch (error) {
      console.error('ICT Admin Sessions Error:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching sessions data',
        error: error.message,
      })
    }
  }
)

// ICT Admin - Get terms for their school
router.get(
  '/terms',
  authenticateToken,
  verifyRoles(roleList.ICT_administrator),
  async (req, res) => {
    try {
      const userSchoolId = req.user.school?._id || req.user.school

      if (!userSchoolId) {
        return res.status(400).json({
          success: false,
          message: 'School information not found for user',
        })
      }

      const terms = await Term.find({
        school: userSchoolId,
      })
        .populate('session', 'name')
        .sort({ createdAt: -1 })

      res.json({
        success: true,
        data: terms,
      })
    } catch (error) {
      console.error('ICT Admin Terms Error:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching terms data',
        error: error.message,
      })
    }
  }
)

module.exports = router
