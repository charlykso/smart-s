const User = require('../model/User')
const Payment = require('../model/Payment')
const Fee = require('../model/Fee')
const School = require('../model/School')
const Term = require('../model/Term')
const Session = require('../model/Session')
const GroupSchool = require('../model/GroupSchool')
const bcrypt = require('bcryptjs')

// Get admin dashboard data
exports.getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.user

    // Get admin info with school information
    const admin = await User.findById(adminId).populate('school')

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })
    }

    // Determine if this is a general admin or school-scoped admin
    const isGeneralAdmin = admin.roles.includes('Admin') && !admin.school
    const schoolFilter = isGeneralAdmin ? {} : { school: admin.school._id }

    // Get system statistics with proper filtering
    const totalUsers = await User.countDocuments(schoolFilter)
    const totalStudents = await User.countDocuments({
      ...schoolFilter,
      roles: 'Student',
    })
    const totalTeachers = await User.countDocuments({
      ...schoolFilter,
      roles: { $in: ['Teacher', 'Principal', 'Headteacher'] },
    })

    // School count - general admin sees all, school admin sees only their school
    const totalSchools = isGeneralAdmin ? await School.countDocuments() : 1

    // Get payment statistics with school filtering
    let paymentFilter = { status: 'success' }
    let revenueMatchFilter = { status: 'success' }
    let pendingFilter = { status: 'pending' }

    if (!isGeneralAdmin) {
      // For school-scoped admin, filter payments by school
      const schoolUsers = await User.find({ school: admin.school._id }).select(
        '_id'
      )
      const userIds = schoolUsers.map((user) => user._id)

      paymentFilter.user = { $in: userIds }
      revenueMatchFilter.user = { $in: userIds }
      pendingFilter.user = { $in: userIds }
    }

    const totalPayments = await Payment.countDocuments(paymentFilter)
    const totalRevenue = await Payment.aggregate([
      { $match: revenueMatchFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])

    const pendingPayments = await Payment.countDocuments(pendingFilter)

    // Get recent activities with school filtering
    const recentUsers = await User.find(schoolFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstname lastname email roles createdAt')

    const recentPayments = await Payment.find(paymentFilter)
      .sort({ trans_date: -1 })
      .limit(5)
      .populate('user', 'firstname lastname email')
      .populate('fee', 'name amount')

    // Get monthly revenue data (last 6 months) with school filtering
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyRevenueMatch = {
      status: 'success',
      trans_date: { $gte: sixMonthsAgo },
    }

    if (!isGeneralAdmin) {
      const schoolUsers = await User.find({ school: admin.school._id }).select(
        '_id'
      )
      const userIds = schoolUsers.map((user) => user._id)
      monthlyRevenueMatch.user = { $in: userIds }
    }

    const monthlyRevenue = await Payment.aggregate([
      { $match: monthlyRevenueMatch },
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

    // Get user distribution by role with school filtering
    const usersByRoleMatch = isGeneralAdmin ? {} : { school: admin.school._id }
    const usersByRole = await User.aggregate([
      { $match: usersByRoleMatch },
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

// Get system activities for admin dashboard
exports.getSystemActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const activities = []

    // Get recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .select('firstname lastname email roles createdAt')

    // Transform user registrations to activities
    recentUsers.forEach((user) => {
      activities.push({
        id: `user-${user._id}`,
        title: 'New User Registered',
        description: `${user.firstname} ${user.lastname} (${user.roles.join(
          ', '
        )}) joined the system`,
        timestamp: user.createdAt,
        type: 'user',
        user: 'System Admin',
        metadata: {
          userId: user._id,
          userEmail: user.email,
          userRoles: user.roles,
        },
      })
    })

    // Get recent successful payments
    const recentPayments = await Payment.find({ status: 'success' })
      .sort({ trans_date: -1 })
      .limit(Math.ceil(limit / 2))
      .populate('user', 'firstname lastname email regNo')
      .populate('fee', 'name amount')

    // Transform payments to activities
    recentPayments.forEach((payment) => {
      activities.push({
        id: `payment-${payment._id}`,
        title: 'Payment Processed',
        description: `${
          payment.fee.name
        } payment of ₦${payment.amount.toLocaleString()} from ${
          payment.user.firstname
        } ${payment.user.lastname}`,
        timestamp: payment.trans_date,
        type: 'payment',
        user: 'Payment System',
        metadata: {
          paymentId: payment._id,
          amount: payment.amount,
          feeName: payment.fee.name,
          userId: payment.user._id,
          userRegNo: payment.user.regNo,
        },
      })
    })

    // Get recent fee approvals
    const recentFees = await Fee.find({ isApproved: true })
      .sort({ updatedAt: -1 })
      .limit(Math.ceil(limit / 3))
      .populate('school', 'name')
      .populate('term', 'name')

    // Transform fee approvals to activities
    recentFees.forEach((fee) => {
      activities.push({
        id: `fee-${fee._id}`,
        title: 'Fee Approved',
        description: `${
          fee.name
        } (₦${fee.amount.toLocaleString()}) approved for ${fee.school.name}`,
        timestamp: fee.updatedAt,
        type: 'fee',
        user: 'Fee Administrator',
        metadata: {
          feeId: fee._id,
          feeName: fee.name,
          amount: fee.amount,
          schoolName: fee.school.name,
          termName: fee.term?.name,
        },
      })
    })

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Limit to requested number
    const limitedActivities = activities.slice(0, parseInt(limit))

    return res.status(200).json({
      success: true,
      data: limitedActivities,
      total: limitedActivities.length,
    })
  } catch (error) {
    console.error('System activities error:', error)
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

// Create school under a group school
exports.createSchool = async (req, res) => {
  try {
    const { name, email, phoneNumber, address, groupSchoolId } = req.body

    // Validate required fields
    if (!name || !email || !phoneNumber || !groupSchoolId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone number, and group school are required',
      })
    }

    // Check if group school exists
    const groupSchool = await GroupSchool.findById(groupSchoolId)
    if (!groupSchool) {
      return res.status(404).json({
        success: false,
        message: 'Group school not found',
      })
    }

    // Check if school with same email already exists
    const existingSchool = await School.findOne({ email })
    if (existingSchool) {
      return res.status(400).json({
        success: false,
        message: 'School with this email already exists',
      })
    }

    // Create new school
    const newSchool = new School({
      groupSchool: groupSchoolId,
      name,
      email,
      phoneNumber,
      address,
      isActive: true,
    })

    await newSchool.save()

    // Populate group school details
    await newSchool.populate('groupSchool')

    res.status(201).json({
      success: true,
      message: 'School created successfully',
      school: newSchool,
    })
  } catch (error) {
    console.error('Create school error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Create ICT Administrator for a school
exports.createICTAdministrator = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phone,
      schoolId,
      regNo,
      gender = 'Male',
      type = 'day',
    } = req.body

    // Validate required fields
    if (!firstname || !lastname || !email || !phone || !schoolId) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, phone, and school are required',
      })
    }

    // Check if school exists
    const school = await School.findById(schoolId)
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found',
      })
    }

    // Check if user with same email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      })
    }

    // Generate default password
    const defaultPassword = 'password123'
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // Generate registration number if not provided
    const finalRegNo = regNo || `ICT${Date.now().toString().slice(-4)}`

    // Create new ICT Administrator
    const newICTAdmin = new User({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      roles: ['ICT_administrator'],
      school: schoolId,
      regNo: finalRegNo,
      gender,
      type,
      status: 'active',
      isActive: true,
    })

    await newICTAdmin.save()

    // Populate school details
    await newICTAdmin.populate('school')

    // Return without password
    const userResponse = newICTAdmin.toObject()
    delete userResponse.password

    res.status(201).json({
      success: true,
      message: 'ICT Administrator created successfully',
      user: userResponse,
      defaultPassword: defaultPassword,
    })
  } catch (error) {
    console.error('Create ICT Administrator error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Get all schools
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.find()
      .populate('groupSchool', 'name')
      .sort({ createdAt: -1 })

    // Get user count for each school
    const schoolsWithUserCount = await Promise.all(
      schools.map(async (school) => {
        const userCount = await User.countDocuments({ school: school._id })
        return {
          ...school.toObject(),
          userCount,
        }
      })
    )

    res.status(200).json({
      success: true,
      schools: schoolsWithUserCount,
    })
  } catch (error) {
    console.error('Get all schools error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Get all ICT administrators
exports.getAllICTAdministrators = async (req, res) => {
  try {
    const ictAdmins = await User.find({ roles: 'ICT_administrator' })
      .populate('school', 'name email')
      .select('-password')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      ictAdministrators: ictAdmins,
    })
  } catch (error) {
    console.error('Get all ICT administrators error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}
