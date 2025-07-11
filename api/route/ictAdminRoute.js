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

      // Get school information
      const school = await School.findById(userSchoolId).populate(
        'groupSchool',
        'name'
      )

      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'School not found',
        })
      }

      // Get dashboard statistics
      const totalStudents = await User.countDocuments({
        school: userSchoolId,
        roles: 'Student',
      })

      const totalFees = await Fee.countDocuments({
        school: userSchoolId,
      })

      const totalSessions = await Session.countDocuments({
        school: userSchoolId,
      })

      const totalTerms = await Term.countDocuments({})

      const stats = {
        totalStudents,
        totalFees,
        totalSessions,
        totalTerms,
      }

      // Get recent students
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
      const { page = 1, limit = 20, search } = req.query

      let query = {
        school: userSchoolId,
        roles: 'Student',
      }

      if (search) {
        query.$or = [
          { firstname: { $regex: search, $options: 'i' } },
          { lastname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { regNo: { $regex: search, $options: 'i' } },
        ]
      }

      const students = await User.find(query)
        .populate('school', 'name')
        .select('firstname lastname email regNo isActive createdAt')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)

      const total = await User.countDocuments(query)

      res.json({
        success: true,
        data: students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
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

// ICT Admin - Get all sessions for their school
router.get(
  '/sessions',
  authenticateToken,
  verifyRoles(roleList.ICT_administrator),
  async (req, res) => {
    try {
      const userSchoolId = req.user.school?._id || req.user.school

      const sessions = await Session.find({
        school: userSchoolId,
      })
        .populate('school', 'name')
        .sort({ createdAt: -1 })

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

// ICT Admin - Get all terms
router.get(
  '/terms',
  authenticateToken,
  verifyRoles(roleList.ICT_administrator),
  async (req, res) => {
    try {
      const terms = await Term.find({})
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

// ICT Admin - Get recent activities
router.get(
  '/activities',
  authenticateToken,
  verifyRoles(roleList.ICT_administrator),
  async (req, res) => {
    try {
      const { limit = 10 } = req.query
      const userSchoolId = req.user.school?._id || req.user.school
      const activities = []

      // Get recent user registrations (especially ICT-related roles and students in their school)
      const recentUsers = await User.find({
        $or: [
          { roles: { $in: ['ICT_administrator', 'Admin', 'Proprietor'] } },
          {
            school: userSchoolId,
            roles: { $in: ['Student', 'Principal', 'Bursar'] },
          },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 3))
        .populate('school', 'name')
        .select('firstname lastname email roles createdAt school')

      // Transform user registrations to activities
      recentUsers.forEach((user) => {
        activities.push({
          _id: `user-${user._id}`,
          type: 'user',
          action: 'New User Registered',
          details: `${user.firstname} ${user.lastname} (${user.roles.join(
            ', '
          )}) joined the system${user.school ? ` at ${user.school.name}` : ''}`,
          timestamp: user.createdAt,
          severity: 'low',
          user: 'System Admin',
        })
      })

      // Get recent bulk student uploads for their school
      const recentStudents = await User.find({
        roles: 'Student',
        school: userSchoolId,
      })
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 4))
        .populate('school', 'name')
        .select('firstname lastname school createdAt')

      // Group students by recent time to simulate bulk uploads
      const studentsByDate = {}
      recentStudents.forEach((student) => {
        const dateKey = new Date(student.createdAt).toDateString()

        if (!studentsByDate[dateKey]) {
          studentsByDate[dateKey] = {
            count: 0,
            timestamp: student.createdAt,
            schoolName: student.school?.name || 'Unknown School',
          }
        }
        studentsByDate[dateKey].count++
      })

      // Add bulk upload activities
      Object.values(studentsByDate).forEach((upload) => {
        if (upload.count > 1) {
          activities.push({
            _id: `bulk-upload-${upload.schoolName}-${upload.timestamp}`,
            type: 'system',
            action: 'Bulk student upload completed',
            details: `${upload.count} students uploaded successfully to ${upload.schoolName}`,
            timestamp: upload.timestamp,
            severity: 'low',
            user: 'user',
          })
        }
      })

      // Get recent school registrations (if they have access to multiple schools)
      const recentSchools = await School.find()
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 4))
        .populate('groupSchool', 'name')
        .select('name groupSchool createdAt')

      // Transform school registrations to activities
      recentSchools.forEach((school) => {
        activities.push({
          _id: `school-${school._id}`,
          type: 'academic',
          action: 'New school registered',
          details: `${school.name} was added to the system`,
          timestamp: school.createdAt,
          severity: 'low',
          user: 'academic',
        })
      })

      // Get recent session creations for their school
      const recentSessions = await Session.find({
        school: userSchoolId,
      })
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 4))
        .populate('school', 'name')
        .select('name school createdAt')

      // Transform session creations to activities
      recentSessions.forEach((session) => {
        activities.push({
          _id: `session-${session._id}`,
          type: 'academic',
          action: 'Academic session created',
          details: `${session.name} session was created for ${
            session.school?.name || 'school'
          }`,
          timestamp: session.createdAt,
          severity: 'low',
          user: 'academic',
        })
      })

      // Get recent term creations
      const recentTerms = await Term.find()
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 4))
        .populate('session', 'name')
        .select('name session createdAt')

      // Transform term creations to activities
      recentTerms.forEach((term) => {
        activities.push({
          _id: `term-${term._id}`,
          type: 'academic',
          action: 'Term setup completed',
          details: `${term.name} configured for ${
            term.session?.name || 'session'
          }`,
          timestamp: term.createdAt,
          severity: 'low',
          user: 'academic',
        })
      })

      // Get recent user role updates (important for ICT admin)
      const recentUpdatedUsers = await User.find({
        updatedAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        $or: [
          { school: userSchoolId },
          { roles: { $in: ['ICT_administrator', 'Admin', 'Proprietor'] } },
        ],
      })
        .sort({ updatedAt: -1 })
        .limit(Math.ceil(limit / 4))
        .populate('school', 'name')
        .select('firstname lastname roles updatedAt school')

      // Transform user updates to activities
      recentUpdatedUsers.forEach((user) => {
        activities.push({
          _id: `user-update-${user._id}`,
          type: 'user',
          action: 'User roles updated',
          details: `${user.firstname} ${
            user.lastname
          } assigned to ${user.roles.join(', ')} role(s)${
            user.school ? ` at ${user.school.name}` : ''
          }`,
          timestamp: user.updatedAt,
          severity: 'low',
          user: 'user',
        })
      })

      // Sort all activities by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      // Limit to requested number
      const limitedActivities = activities.slice(0, parseInt(limit))

      res.json({
        success: true,
        data: limitedActivities,
        total: limitedActivities.length,
      })
    } catch (error) {
      console.error('ICT Admin Activities Error:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching activities data',
        error: error.message,
      })
    }
  }
)

module.exports = router
