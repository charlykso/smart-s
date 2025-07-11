const User = require('../model/User')
const Payment = require('../model/Payment')
const Fee = require('../model/Fee')
const School = require('../model/School')
const Term = require('../model/Term')
const Session = require('../model/Session')

// Get principal dashboard data
exports.getPrincipalDashboard = async (req, res) => {
  try {
    const principalId = req.user.id

    // Get principal info
    const principal = await User.findById(principalId)
    if (!principal) {
      return res.status(404).json({
        success: false,
        message: 'Principal not found',
      })
    }

    // Try to get principal's school
    let principalSchool = null
    if (principal.school) {
      principalSchool = await School.findById(principal.school)
    }

    // Get school statistics (if principal has a school)
    let schoolStats = {
      totalStudents: 0,
      totalTeachers: 0,
      totalStaff: 0,
      activeTerms: 0,
    }

    if (principalSchool) {
      schoolStats.totalStudents = await User.countDocuments({
        school: principalSchool._id,
        roles: 'Student',
      })

      schoolStats.totalTeachers = await User.countDocuments({
        school: principalSchool._id,
        roles: { $in: ['Teacher', 'Headteacher'] },
      })

      schoolStats.totalStaff = await User.countDocuments({
        school: principalSchool._id,
        roles: { $nin: ['Student', 'Parent'] },
      })

      schoolStats.activeTerms = await Term.countDocuments({
        school: principalSchool._id,
        isActive: true,
      })
    }

    // Get financial overview for the school
    let financialOverview = {
      totalRevenue: 0,
      pendingPayments: 0,
      thisMonthRevenue: 0,
      outstandingFees: 0,
      collectionRate: 0,
    }

    if (principalSchool) {
      // Get school fees
      const schoolFees = await Fee.find({ school: principalSchool._id })
      const feeIds = schoolFees.map((fee) => fee._id)

      // Calculate total expected fees
      const totalExpectedFees =
        schoolFees.reduce((sum, fee) => sum + fee.amount, 0) *
        schoolStats.totalStudents

      // Get payments for school fees
      const schoolPayments = await Payment.find({
        fee: { $in: feeIds },
        status: 'success',
      })

      financialOverview.totalRevenue = schoolPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      )

      // Calculate outstanding fees
      financialOverview.outstandingFees = Math.max(
        0,
        totalExpectedFees - financialOverview.totalRevenue
      )

      // Calculate collection rate
      if (totalExpectedFees > 0) {
        financialOverview.collectionRate =
          (financialOverview.totalRevenue / totalExpectedFees) * 100
      } else {
        financialOverview.collectionRate = 0
      }

      financialOverview.pendingPayments = await Payment.countDocuments({
        fee: { $in: feeIds },
        status: 'pending',
      })

      // This month revenue
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const thisMonthPayments = await Payment.find({
        fee: { $in: feeIds },
        status: 'success',
        trans_date: { $gte: thisMonth },
      })

      financialOverview.thisMonthRevenue = thisMonthPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      )
    }

    // Get recent activities
    const recentActivities = []

    if (principalSchool) {
      // Recent student registrations
      const recentStudents = await User.find({
        school: principalSchool._id,
        roles: 'Student',
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('firstname lastname createdAt')

      recentStudents.forEach((student) => {
        recentActivities.push({
          id: `student-${student._id}`,
          title: 'New Student Registration',
          description: `${student.firstname} ${student.lastname} registered`,
          timestamp: student.createdAt,
          type: 'academic',
          user: 'Registration System',
        })
      })

      // Recent payments
      const recentPayments = await Payment.find({
        fee: {
          $in: await Fee.find({ school: principalSchool._id }).distinct('_id'),
        },
        status: 'success',
      })
        .sort({ trans_date: -1 })
        .limit(3)
        .populate('user', 'firstname lastname')
        .populate('fee', 'name amount')

      recentPayments.forEach((payment) => {
        recentActivities.push({
          id: `payment-${payment._id}`,
          title: 'Payment Received',
          description: `${payment.user.firstname} ${payment.user.lastname} paid ${payment.fee.name}`,
          timestamp: payment.trans_date,
          type: 'payment',
          user: 'Payment System',
        })
      })
    }

    // Sort activities by timestamp
    recentActivities.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )

    // Get current academic session/term
    let currentAcademic = null
    if (principalSchool) {
      const currentTerm = await Term.findOne({
        school: principalSchool._id,
        isActive: true,
      }).populate('session')

      if (currentTerm) {
        currentAcademic = {
          term: currentTerm.name,
          session: currentTerm.session?.name || 'Unknown Session',
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        principal: {
          _id: principal._id,
          firstname: principal.firstname,
          lastname: principal.lastname,
          email: principal.email,
          roles: principal.roles,
        },
        school: principalSchool
          ? {
              _id: principalSchool._id,
              name: principalSchool.name,
              address: principalSchool.address,
            }
          : null,
        statistics: schoolStats,
        financial: financialOverview,
        recentActivities: recentActivities.slice(0, 5),
        currentAcademic,
      },
    })
  } catch (error) {
    console.error('Principal dashboard error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// Get school academic overview
exports.getAcademicOverview = async (req, res) => {
  try {
    const principalId = req.user.id
    const principal = await User.findById(principalId)

    if (!principal || !principal.school) {
      return res.status(404).json({
        success: false,
        message: 'School not found',
      })
    }

    // Get students by class/level
    const studentsByClass = await User.aggregate([
      {
        $match: {
          school: principal.school,
          roles: 'Student',
        },
      },
      {
        $lookup: {
          from: 'classarms',
          localField: 'classArm',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      {
        $group: {
          _id: '$classInfo.name',
          count: { $sum: 1 },
        },
      },
    ])

    // Get fee collection status
    const schoolFees = await Fee.find({
      school: principal.school,
      isApproved: true,
    })

    const feeCollection = await Promise.all(
      schoolFees.map(async (fee) => {
        const totalStudents = await User.countDocuments({
          school: principal.school,
          roles: 'Student',
        })

        const paidStudents = await Payment.countDocuments({
          fee: fee._id,
          status: 'success',
        })

        return {
          feeName: fee.name,
          amount: fee.amount,
          totalStudents,
          paidStudents,
          collectionRate:
            totalStudents > 0 ? (paidStudents / totalStudents) * 100 : 0,
        }
      })
    )

    return res.status(200).json({
      success: true,
      data: {
        studentsByClass,
        feeCollection,
      },
    })
  } catch (error) {
    console.error('Academic overview error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// Get staff management data
exports.getStaffManagement = async (req, res) => {
  try {
    const principalId = req.user.id
    const principal = await User.findById(principalId)

    if (!principal || !principal.school) {
      return res.status(404).json({
        success: false,
        message: 'School not found',
      })
    }

    const staff = await User.find({
      school: principal.school,
      roles: { $nin: ['Student', 'Parent'] },
    })
      .select('-password')
      .sort({ createdAt: -1 })

    const staffByRole = await User.aggregate([
      {
        $match: {
          school: principal.school,
          roles: { $nin: ['Student', 'Parent'] },
        },
      },
      { $unwind: '$roles' },
      {
        $group: {
          _id: '$roles',
          count: { $sum: 1 },
        },
      },
    ])

    return res.status(200).json({
      success: true,
      data: {
        staff,
        staffByRole,
      },
    })
  } catch (error) {
    console.error('Staff management error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
