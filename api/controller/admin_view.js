const User = require('../model/User')
const Payment = require('../model/Payment')
const Fee = require('../model/Fee')
const School = require('../model/School')
const Term = require('../model/Term')
const Session = require('../model/Session')

// Get admin dashboard data
exports.getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.user

    // Get admin info
    const admin = await User.findById(adminId)

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })
    }

    // Get system statistics
    const totalUsers = await User.countDocuments()
    const totalStudents = await User.countDocuments({ roles: 'Student' })
    const totalTeachers = await User.countDocuments({
      roles: { $in: ['Teacher', 'Principal', 'Headteacher'] },
    })
    const totalSchools = await School.countDocuments()

    // Get payment statistics
    const totalPayments = await Payment.countDocuments({ status: 'success' })
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])

    const pendingPayments = await Payment.countDocuments({ status: 'pending' })

    // Get recent activities
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstname lastname email roles createdAt')

    const recentPayments = await Payment.find({ status: 'success' })
      .sort({ trans_date: -1 })
      .limit(5)
      .populate('user', 'firstname lastname email')
      .populate('fee', 'name amount')

    // Get monthly revenue data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          trans_date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$trans_date' },
            month: { $month: '$trans_date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    // Get user distribution by role
    const usersByRole = await User.aggregate([
      { $unwind: '$roles' },
      { $group: { _id: '$roles', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    return res.status(200).json({
      success: true,
      data: {
        admin: {
          _id: admin._id,
          firstname: admin.firstname,
          lastname: admin.lastname,
          email: admin.email,
          roles: admin.roles,
        },
        statistics: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalSchools,
          totalPayments,
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingPayments,
        },
        recentActivities: {
          users: recentUsers,
          payments: recentPayments,
        },
        analytics: {
          monthlyRevenue,
          usersByRole,
        },
      },
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// Get system overview
exports.getSystemOverview = async (req, res) => {
  try {
    // Get active sessions and terms
    const activeSessions = await Session.find({ isActive: true }).populate(
      'school',
      'name'
    )

    const activeTerms = await Term.find({ isActive: true })
      .populate('session', 'name')
      .populate('school', 'name')

    // Get recent system activities
    const recentActivities = await User.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('firstname lastname email roles updatedAt')

    // Get fee statistics
    const totalFees = await Fee.countDocuments()
    const approvedFees = await Fee.countDocuments({ isApproved: true })
    const pendingFees = await Fee.countDocuments({ isApproved: false })

    return res.status(200).json({
      success: true,
      data: {
        sessions: activeSessions,
        terms: activeTerms,
        recentActivities,
        feeStatistics: {
          total: totalFees,
          approved: approvedFees,
          pending: pendingFees,
        },
      },
    })
  } catch (error) {
    console.error('System overview error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// Get user management data
exports.getUserManagement = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query

    // Build query
    const query = {}
    if (role && role !== 'all') {
      query.roles = role
    }
    if (status && status !== 'all') {
      query.status = status
    }
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password')
      .populate('school', 'name')
      .populate('profile', 'img')

    const total = await User.countDocuments(query)

    // Calculate user stats
    const userStats = {
      totalUsers: total,
      activeUsers: await User.countDocuments({ ...query, status: 'active' }),
      inactiveUsers: await User.countDocuments({
        ...query,
        status: 'inactive',
      }),
      usersByRole: await User.aggregate([
        { $match: query },
        { $unwind: '$roles' },
        { $group: { _id: '$roles', count: { $sum: 1 } } },
        { $project: { role: '$_id', count: 1, _id: 0 } },
      ]),
    }

    return res.status(200).json({
      success: true,
      data: {
        users: users || [],
        userStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('User management error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Get financial overview
exports.getFinancialOverview = async (req, res) => {
  try {
    const { period = '30' } = req.query
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(period))

    // Payment statistics
    const paymentStats = await Payment.aggregate([
      {
        $match: {
          trans_date: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ])

    // Daily revenue trend
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          trans_date: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$trans_date' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Payment methods distribution
    const paymentMethods = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          trans_date: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: '$mode_of_payment',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ])

    return res.status(200).json({
      success: true,
      data: {
        paymentStats,
        dailyRevenue,
        paymentMethods,
      },
    })
  } catch (error) {
    console.error('Financial overview error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
