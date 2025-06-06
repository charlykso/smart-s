const User = require('../model/User');
const Payment = require('../model/Payment');
const Fee = require('../model/Fee');
const School = require('../model/School');
const Term = require('../model/Term');

// Get bursar dashboard data
exports.getBursarDashboard = async (req, res) => {
  try {
    const bursarId = req.user.id;
    
    // Get bursar info
    const bursar = await User.findById(bursarId);
    if (!bursar) {
      return res.status(404).json({
        success: false,
        message: 'Bursar not found'
      });
    }

    // Try to get bursar's school
    let bursarSchool = null;
    if (bursar.school) {
      bursarSchool = await School.findById(bursar.school);
    }

    // Get financial statistics
    let financialStats = {
      totalRevenue: 0,
      todayRevenue: 0,
      thisMonthRevenue: 0,
      pendingPayments: 0,
      totalTransactions: 0,
      outstandingAmount: 0
    };

    if (bursarSchool) {
      // Get school fees
      const schoolFees = await Fee.find({ school: bursarSchool._id });
      const feeIds = schoolFees.map(fee => fee._id);

      // Total revenue
      const totalRevenueResult = await Payment.aggregate([
        { $match: { fee: { $in: feeIds }, status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      financialStats.totalRevenue = totalRevenueResult[0]?.total || 0;

      // Today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayRevenueResult = await Payment.aggregate([
        { 
          $match: { 
            fee: { $in: feeIds }, 
            status: 'success',
            trans_date: { $gte: today, $lt: tomorrow }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      financialStats.todayRevenue = todayRevenueResult[0]?.total || 0;

      // This month's revenue
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthRevenueResult = await Payment.aggregate([
        { 
          $match: { 
            fee: { $in: feeIds }, 
            status: 'success',
            trans_date: { $gte: thisMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      financialStats.thisMonthRevenue = thisMonthRevenueResult[0]?.total || 0;

      // Pending payments
      financialStats.pendingPayments = await Payment.countDocuments({
        fee: { $in: feeIds },
        status: 'pending'
      });

      // Total transactions
      financialStats.totalTransactions = await Payment.countDocuments({
        fee: { $in: feeIds }
      });

      // Calculate outstanding amount
      const totalStudents = await User.countDocuments({
        school: bursarSchool._id,
        roles: 'Student'
      });

      const totalExpectedRevenue = schoolFees.reduce((sum, fee) => {
        return sum + (fee.amount * totalStudents);
      }, 0);

      financialStats.outstandingAmount = totalExpectedRevenue - financialStats.totalRevenue;
    }

    // Get recent transactions
    let recentTransactions = [];
    if (bursarSchool) {
      const schoolFees = await Fee.find({ school: bursarSchool._id });
      const feeIds = schoolFees.map(fee => fee._id);

      recentTransactions = await Payment.find({
        fee: { $in: feeIds }
      })
      .sort({ trans_date: -1 })
      .limit(10)
      .populate('user', 'firstname lastname email regNo')
      .populate('fee', 'name amount type');
    }

    // Get payment methods breakdown
    let paymentMethods = [];
    if (bursarSchool) {
      const schoolFees = await Fee.find({ school: bursarSchool._id });
      const feeIds = schoolFees.map(fee => fee._id);

      paymentMethods = await Payment.aggregate([
        { 
          $match: { 
            fee: { $in: feeIds }, 
            status: 'success' 
          } 
        },
        {
          $group: {
            _id: '$mode_of_payment',
            count: { $sum: 1 },
            total: { $sum: '$amount' }
          }
        }
      ]);
    }

    // Get fee collection status
    let feeCollectionStatus = [];
    if (bursarSchool) {
      const schoolFees = await Fee.find({ 
        school: bursarSchool._id,
        isApproved: true 
      });

      const totalStudents = await User.countDocuments({
        school: bursarSchool._id,
        roles: 'Student'
      });

      feeCollectionStatus = await Promise.all(
        schoolFees.map(async (fee) => {
          const paidCount = await Payment.countDocuments({
            fee: fee._id,
            status: 'success'
          });

          const totalCollected = await Payment.aggregate([
            { $match: { fee: fee._id, status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]);

          return {
            feeId: fee._id,
            feeName: fee.name,
            feeAmount: fee.amount,
            expectedTotal: fee.amount * totalStudents,
            collectedTotal: totalCollected[0]?.total || 0,
            paidStudents: paidCount,
            totalStudents,
            collectionRate: totalStudents > 0 ? (paidCount / totalStudents) * 100 : 0
          };
        })
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        bursar: {
          _id: bursar._id,
          firstname: bursar.firstname,
          lastname: bursar.lastname,
          email: bursar.email,
          roles: bursar.roles
        },
        school: bursarSchool ? {
          _id: bursarSchool._id,
          name: bursarSchool.name,
          address: bursarSchool.address
        } : null,
        financialStats,
        recentTransactions,
        paymentMethods,
        feeCollectionStatus
      }
    });

  } catch (error) {
    console.error('Bursar dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get detailed payment reports
exports.getPaymentReports = async (req, res) => {
  try {
    const bursarId = req.user.id;
    const { startDate, endDate, feeType, paymentMethod } = req.query;
    
    const bursar = await User.findById(bursarId);
    if (!bursar || !bursar.school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Build query
    const schoolFees = await Fee.find({ school: bursar.school });
    const feeIds = schoolFees.map(fee => fee._id);
    
    const query = { fee: { $in: feeIds } };
    
    if (startDate && endDate) {
      query.trans_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (paymentMethod) {
      query.mode_of_payment = paymentMethod;
    }

    const payments = await Payment.find(query)
      .populate('user', 'firstname lastname email regNo')
      .populate('fee', 'name amount type')
      .sort({ trans_date: -1 });

    // Generate summary
    const summary = {
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      totalTransactions: payments.length,
      successfulPayments: payments.filter(p => p.status === 'success').length,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      failedPayments: payments.filter(p => p.status === 'failed').length
    };

    return res.status(200).json({
      success: true,
      data: {
        payments,
        summary
      }
    });

  } catch (error) {
    console.error('Payment reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get outstanding fees report
exports.getOutstandingFeesReport = async (req, res) => {
  try {
    const bursarId = req.user.id;
    const bursar = await User.findById(bursarId);
    
    if (!bursar || !bursar.school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Get all students in the school
    const students = await User.find({
      school: bursar.school,
      roles: 'Student'
    }).select('firstname lastname email regNo');

    // Get all approved fees for the school
    const schoolFees = await Fee.find({
      school: bursar.school,
      isApproved: true
    });

    // Calculate outstanding fees for each student
    const outstandingReport = await Promise.all(
      students.map(async (student) => {
        const studentPayments = await Payment.find({
          user: student._id,
          status: 'success'
        }).populate('fee');

        const paidFeeIds = studentPayments.map(p => p.fee._id.toString());
        const outstandingFees = schoolFees.filter(fee => 
          !paidFeeIds.includes(fee._id.toString())
        );

        const totalOutstanding = outstandingFees.reduce((sum, fee) => sum + fee.amount, 0);

        return {
          student: {
            _id: student._id,
            name: `${student.firstname} ${student.lastname}`,
            email: student.email,
            regNo: student.regNo
          },
          outstandingFees: outstandingFees.map(fee => ({
            _id: fee._id,
            name: fee.name,
            amount: fee.amount,
            type: fee.type
          })),
          totalOutstanding
        };
      })
    );

    // Filter students with outstanding fees
    const studentsWithOutstanding = outstandingReport.filter(
      report => report.totalOutstanding > 0
    );

    return res.status(200).json({
      success: true,
      data: {
        outstandingReport: studentsWithOutstanding,
        summary: {
          totalStudents: students.length,
          studentsWithOutstanding: studentsWithOutstanding.length,
          totalOutstandingAmount: studentsWithOutstanding.reduce(
            (sum, report) => sum + report.totalOutstanding, 0
          )
        }
      }
    });

  } catch (error) {
    console.error('Outstanding fees report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
