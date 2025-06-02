const Payment = require('../model/Payment')
const Fee = require('../model/Fee')
const User = require('../model/User')
const Term = require('../model/Term')
const Session = require('../model/Session')

// Get student dashboard data
exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id // From JWT token
    console.log('Student ID from token:', studentId)

    // Get student info (with optional population)
    const student = await User.findById(studentId)
    console.log('Student found:', student ? 'Yes' : 'No')

    if (!student) {
      console.log('Student not found in database')
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      })
    }

    // Try to populate optional fields
    try {
      if (student.school) {
        await student.populate('school', 'name')
      }
      if (student.classArm) {
        await student.populate('classArm', 'name')
      }
      if (student.profile) {
        await student.populate('profile')
      }
    } catch (populateError) {
      console.log('Population warning:', populateError.message)
      // Continue without population
    }

    // Get current term fees (only if student has a school)
    let currentTerm = null
    let termFees = []

    if (student.school) {
      currentTerm = await Term.findOne({
        school: student.school,
        isActive: true,
      }).populate('session')

      // Get all fees for current term
      if (currentTerm) {
        termFees = await Fee.find({
          term: currentTerm._id,
          isApproved: true,
          isActive: true,
        })
      }
    }

    // Get student payments
    const payments = await Payment.find({
      user: studentId,
    }).populate('fee', 'name amount type')

    // Calculate outstanding fees
    const paidFeeIds = payments.map((p) => p.fee._id.toString())
    const outstandingFees = termFees.filter(
      (fee) => !paidFeeIds.includes(fee._id.toString())
    )

    const totalOutstanding = outstandingFees.reduce(
      (sum, fee) => sum + fee.amount,
      0
    )
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

    // Mock academic data (would come from academic system)
    const academicProgress = {
      currentAverage: 85,
      attendanceRate: 92,
      completedAssignments: 8,
      totalAssignments: 10,
    }

    return res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          firstname: student.firstname,
          lastname: student.lastname,
          email: student.email,
          regNo: student.regNo,
          school: student.school,
          classArm: student.classArm,
          profile: student.profile,
        },
        financial: {
          totalOutstanding,
          totalPaid,
          outstandingFees: outstandingFees.map((fee) => ({
            _id: fee._id,
            name: fee.name,
            amount: fee.amount,
            type: fee.type,
            dueDate: fee.dueDate,
          })),
          recentPayments: payments.slice(-5).map((payment) => ({
            _id: payment._id,
            amount: payment.amount,
            fee: payment.fee,
            status: payment.status,
            mode: payment.mode_of_payment,
            date: payment.trans_date,
            reference: payment.trx_ref,
          })),
        },
        academic: academicProgress,
        currentTerm: currentTerm
          ? {
              _id: currentTerm._id,
              name: currentTerm.name,
              session: currentTerm.session,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Student dashboard error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// Get student payments history
exports.getStudentPayments = async (req, res) => {
  try {
    const studentId = req.user.id
    const { page = 1, limit = 10, status, term } = req.query

    const query = { user: studentId }
    if (status) query.status = status
    if (term) {
      const termFees = await Fee.find({ term })
      query.fee = { $in: termFees.map((f) => f._id) }
    }

    const payments = await Payment.find(query)
      .populate('fee', 'name amount type term')
      .populate({
        path: 'fee',
        populate: {
          path: 'term',
          select: 'name',
          populate: {
            path: 'session',
            select: 'name',
          },
        },
      })
      .sort({ trans_date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Payment.countDocuments(query)

    return res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Student payments error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// Get student outstanding fees
exports.getStudentOutstandingFees = async (req, res) => {
  try {
    const studentId = req.user.id

    const student = await User.findById(studentId).populate('school')
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      })
    }

    // Get current term
    const currentTerm = await Term.findOne({
      school: student.school,
      isActive: true,
    })

    // Get all approved fees for current term
    const termFees = await Fee.find({
      term: currentTerm?._id,
      isApproved: true,
      isActive: true,
    }).populate('term', 'name')

    // Get student payments
    const payments = await Payment.find({
      user: studentId,
      status: 'success',
    })

    // Calculate outstanding fees
    const paidFeeIds = payments.map((p) => p.fee.toString())
    const outstandingFees = termFees.filter(
      (fee) => !paidFeeIds.includes(fee._id.toString())
    )

    return res.status(200).json({
      success: true,
      data: {
        outstandingFees,
        totalAmount: outstandingFees.reduce((sum, fee) => sum + fee.amount, 0),
        currentTerm,
      },
    })
  } catch (error) {
    console.error('Student outstanding fees error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

// Get student academic summary (mock data for now)
exports.getStudentAcademicSummary = async (req, res) => {
  try {
    const studentId = req.user.id

    // Mock academic data - in real implementation, this would come from academic system
    const academicData = {
      currentTerm: {
        average: 85,
        position: 5,
        totalStudents: 45,
        subjects: [
          { name: 'Mathematics', score: 88, grade: 'A' },
          { name: 'English', score: 82, grade: 'B+' },
          { name: 'Physics', score: 90, grade: 'A+' },
          { name: 'Chemistry', score: 85, grade: 'A' },
          { name: 'Biology', score: 78, grade: 'B' },
        ],
      },
      attendance: {
        rate: 92,
        daysPresent: 46,
        totalDays: 50,
        lateArrivals: 3,
      },
      assignments: {
        completed: 8,
        total: 10,
        pending: 2,
        overdue: 0,
      },
    }

    return res.status(200).json({
      success: true,
      data: academicData,
    })
  } catch (error) {
    console.error('Student academic summary error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
