const User = require('../model/User')
const Payment = require('../model/Payment')
const Fee = require('../model/Fee')
const School = require('../model/School')
const GroupSchool = require('../model/GroupSchool')
const Session = require('../model/Session')
const Term = require('../model/Term')
const ClassArm = require('../model/ClassArm')

// Get ICT Admin dashboard data
exports.getICTAdminDashboard = async (req, res) => {
  try {
    const currentUser = req.user

    // Mock system metrics - in production, these would come from system monitoring
    const systemMetrics = {
      serverUptime: 99.9,
      cpuUsage: 45,
      memoryUsage: 67,
      diskUsage: 78,
      networkLatency: 12,
      activeConnections: 1847,
    }

    // Get real user metrics
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const recentLogins = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })

    const userMetrics = {
      totalUsers,
      activeUsers,
      onlineUsers: Math.floor(activeUsers * 0.15), // Mock online users
      recentLogins,
      failedLogins: 23, // Mock failed logins
      blockedIPs: 12, // Mock blocked IPs
    }

    // Mock system health
    const systemHealth = {
      status: 'healthy',
      databaseStatus: 'connected',
      apiResponseTime: 145,
      errorRate: 0.02,
      lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      backupStatus: 'success',
    }

    // Get technical stats
    const totalSchools = await School.countDocuments()
    const totalPaymentProfiles = await Payment.countDocuments()
    const totalEmailsSent = 15678 // Mock email count
    const systemErrors = 3 // Mock system errors
    const apiCalls = 234567 // Mock API calls
    const dataTransfer = 1.2 // Mock data transfer in GB

    const technicalStats = {
      totalSchools,
      totalPaymentProfiles,
      totalEmailsSent,
      systemErrors,
      apiCalls,
      dataTransfer,
    }

    // Get real recent activities (filtered for ICT admin scope)
    const recentActivities = await getICTAdminActivities(10)

    // Mock security metrics
    const securityMetrics = {
      suspiciousActivities: 7,
      blockedAttempts: 23,
      activeTokens: 456,
      expiredTokens: 89,
      securityScore: 87,
    }

    const dashboardData = {
      ictAdmin: {
        _id: currentUser.Id,
        firstname: currentUser.firstname,
        lastname: currentUser.lastname,
        email: currentUser.email,
        roles: currentUser.roles,
      },
      systemMetrics,
      userMetrics,
      systemHealth,
      technicalStats,
      recentActivities,
      securityMetrics,
    }

    return res.status(200).json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error('ICT Admin dashboard error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// Get ICT Admin specific activities
exports.getICTAdminActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const activities = await getICTAdminActivities(parseInt(limit))

    return res.status(200).json({
      success: true,
      data: activities,
      total: activities.length,
    })
  } catch (error) {
    console.error('ICT Admin activities error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// Helper function to get ICT admin specific activities
async function getICTAdminActivities(limit) {
  const activities = []

  try {
    // Get recent user registrations (especially ICT-related roles)
    const recentUsers = await User.find({
      roles: { $in: ['ICT_administrator', 'Admin', 'Proprietor'] },
    })
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 3))
      .select('firstname lastname email roles createdAt')

    // Transform user registrations to activities
    recentUsers.forEach((user) => {
      activities.push({
        _id: `user-${user._id}`,
        type: 'user',
        action: 'New User Registered',
        details: `${user.firstname} ${user.lastname} (${user.roles.join(
          ', '
        )}) joined the system`,
        timestamp: user.createdAt,
        severity: 'low',
        user: 'System Admin',
      })
    })

    // Get recent bulk student uploads
    const recentStudents = await User.find({
      roles: 'Student',
    })
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 4))
      .populate('school', 'name')
      .select('firstname lastname school createdAt')

    // Group students by school and recent time to simulate bulk uploads
    const studentsBySchool = {}
    recentStudents.forEach((student) => {
      const schoolName = student.school?.name || 'Unknown School'
      const dateKey = new Date(student.createdAt).toDateString()
      const key = `${schoolName}-${dateKey}`

      if (!studentsBySchool[key]) {
        studentsBySchool[key] = {
          schoolName,
          count: 0,
          timestamp: student.createdAt,
        }
      }
      studentsBySchool[key].count++
    })

    // Add bulk upload activities
    Object.values(studentsBySchool).forEach((upload) => {
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

    // Get recent school registrations
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

    // Get recent session creations
    const recentSessions = await Session.find()
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
          session.school?.name || 'all schools'
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
    })
      .sort({ updatedAt: -1 })
      .limit(Math.ceil(limit / 4))
      .select('firstname lastname roles updatedAt')

    // Transform user updates to activities
    recentUpdatedUsers.forEach((user) => {
      activities.push({
        _id: `user-update-${user._id}`,
        type: 'user',
        action: 'User roles updated',
        details: `${user.firstname} ${
          user.lastname
        } assigned to ${user.roles.join(', ')} role(s)`,
        timestamp: user.updatedAt,
        severity: 'low',
        user: 'user',
      })
    })

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Limit to requested number
    return activities.slice(0, limit)
  } catch (error) {
    console.error('Error getting ICT admin activities:', error)
    return []
  }
}
