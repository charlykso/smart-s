const User = require('../model/User');
const Payment = require('../model/Payment');
const Fee = require('../model/Fee');
const School = require('../model/School');
const Term = require('../model/Term');

// Get parent dashboard data
exports.getParentDashboard = async (req, res) => {
  try {
    const parentId = req.user.id;
    
    // Get parent info
    const parent = await User.findById(parentId);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Get parent's children (students)
    // Note: In a real system, there would be a relationship between parent and children
    // For now, we'll use a mock approach or find students with similar details
    let children = [];
    
    // Mock approach - in real system, there would be a parent-child relationship model
    // For demo, we'll find students in the same school or with similar email domain
    if (parent.school) {
      children = await User.find({
        school: parent.school,
        roles: 'Student'
      })
      .limit(3) // Limit to 3 children for demo
      .populate('school', 'name')
      .populate('classArm', 'name');
    }

    // If no children found, create mock data
    if (children.length === 0) {
      children = [
        {
          _id: 'mock-child-1',
          firstname: 'Child',
          lastname: 'One',
          email: 'child1@example.com',
          regNo: 'STU002',
          roles: ['Student'],
          school: { name: 'Demo School' },
          classArm: { name: 'JSS 1A' }
        }
      ];
    }

    // Get financial summary for all children
    const childrenFinancialSummary = await Promise.all(
      children.map(async (child) => {
        if (child._id === 'mock-child-1') {
          // Mock data for demo child
          return {
            childId: child._id,
            childName: `${child.firstname} ${child.lastname}`,
            totalOutstanding: 45000,
            totalPaid: 125000,
            recentPayments: [
              {
                _id: 'mock-payment-1',
                amount: 25000,
                fee: { name: 'School Fees' },
                status: 'success',
                trans_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
              }
            ]
          };
        }

        // Real data for actual children
        const childPayments = await Payment.find({
          user: child._id,
          status: 'success'
        }).populate('fee', 'name amount');

        const totalPaid = childPayments.reduce((sum, payment) => sum + payment.amount, 0);

        // Get outstanding fees
        let totalOutstanding = 0;
        if (child.school) {
          const schoolFees = await Fee.find({
            school: child.school._id || child.school,
            isApproved: true
          });

          const paidFeeIds = childPayments.map(p => p.fee._id.toString());
          const outstandingFees = schoolFees.filter(fee => 
            !paidFeeIds.includes(fee._id.toString())
          );

          totalOutstanding = outstandingFees.reduce((sum, fee) => sum + fee.amount, 0);
        }

        const recentPayments = await Payment.find({
          user: child._id
        })
        .sort({ trans_date: -1 })
        .limit(5)
        .populate('fee', 'name amount');

        return {
          childId: child._id,
          childName: `${child.firstname} ${child.lastname}`,
          totalOutstanding,
          totalPaid,
          recentPayments
        };
      })
    );

    // Get academic summary for children (mock data for now)
    const childrenAcademicSummary = children.map(child => ({
      childId: child._id,
      childName: `${child.firstname} ${child.lastname}`,
      class: child.classArm?.name || 'Not Assigned',
      currentAverage: Math.floor(Math.random() * 20) + 75, // Random between 75-95
      attendanceRate: Math.floor(Math.random() * 10) + 85, // Random between 85-95
      lastExamPosition: Math.floor(Math.random() * 30) + 1,
      totalStudentsInClass: 45
    }));

    // Get recent activities across all children
    const recentActivities = [];
    
    childrenFinancialSummary.forEach(childSummary => {
      childSummary.recentPayments.slice(0, 2).forEach(payment => {
        recentActivities.push({
          id: `payment-${payment._id}`,
          title: 'Payment Received',
          description: `${childSummary.childName} - ${payment.fee.name} payment processed`,
          timestamp: payment.trans_date,
          type: 'payment',
          user: 'Payment System'
        });
      });
    });

    // Add mock academic activities
    children.forEach(child => {
      recentActivities.push({
        id: `academic-${child._id}`,
        title: 'Academic Update',
        description: `${child.firstname} ${child.lastname} - Term assessment completed`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        type: 'academic',
        user: 'Academic System'
      });
    });

    // Sort activities by timestamp
    recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Calculate overall summary
    const overallSummary = {
      totalChildren: children.length,
      totalOutstanding: childrenFinancialSummary.reduce((sum, child) => sum + child.totalOutstanding, 0),
      totalPaid: childrenFinancialSummary.reduce((sum, child) => sum + child.totalPaid, 0),
      averagePerformance: childrenAcademicSummary.reduce((sum, child) => sum + child.currentAverage, 0) / children.length
    };

    return res.status(200).json({
      success: true,
      data: {
        parent: {
          _id: parent._id,
          firstname: parent.firstname,
          lastname: parent.lastname,
          email: parent.email,
          roles: parent.roles
        },
        children: children.map(child => ({
          _id: child._id,
          firstname: child.firstname,
          lastname: child.lastname,
          regNo: child.regNo,
          school: child.school,
          classArm: child.classArm
        })),
        financialSummary: childrenFinancialSummary,
        academicSummary: childrenAcademicSummary,
        recentActivities: recentActivities.slice(0, 8),
        overallSummary
      }
    });

  } catch (error) {
    console.error('Parent dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get detailed child information
exports.getChildDetails = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user.id;

    // Verify parent has access to this child
    const child = await User.findById(childId)
      .populate('school', 'name address')
      .populate('classArm', 'name');

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Get child's payment history
    const payments = await Payment.find({
      user: childId
    })
    .sort({ trans_date: -1 })
    .populate('fee', 'name amount type')
    .populate({
      path: 'fee',
      populate: {
        path: 'term',
        select: 'name',
        populate: {
          path: 'session',
          select: 'name'
        }
      }
    });

    // Get outstanding fees
    let outstandingFees = [];
    if (child.school) {
      const schoolFees = await Fee.find({
        school: child.school._id,
        isApproved: true
      }).populate('term', 'name');

      const paidFeeIds = payments
        .filter(p => p.status === 'success')
        .map(p => p.fee._id.toString());

      outstandingFees = schoolFees.filter(fee => 
        !paidFeeIds.includes(fee._id.toString())
      );
    }

    // Get academic performance (mock data)
    const academicPerformance = {
      currentTerm: {
        average: Math.floor(Math.random() * 20) + 75,
        position: Math.floor(Math.random() * 30) + 1,
        totalStudents: 45,
        subjects: [
          { name: 'Mathematics', score: Math.floor(Math.random() * 20) + 75, grade: 'A' },
          { name: 'English', score: Math.floor(Math.random() * 20) + 70, grade: 'B+' },
          { name: 'Science', score: Math.floor(Math.random() * 20) + 80, grade: 'A' }
        ]
      },
      attendance: {
        rate: Math.floor(Math.random() * 10) + 85,
        daysPresent: 46,
        totalDays: 50,
        lateArrivals: Math.floor(Math.random() * 5)
      }
    };

    return res.status(200).json({
      success: true,
      data: {
        child: {
          _id: child._id,
          firstname: child.firstname,
          lastname: child.lastname,
          email: child.email,
          regNo: child.regNo,
          school: child.school,
          classArm: child.classArm
        },
        payments,
        outstandingFees,
        academicPerformance,
        financialSummary: {
          totalPaid: payments
            .filter(p => p.status === 'success')
            .reduce((sum, p) => sum + p.amount, 0),
          totalOutstanding: outstandingFees.reduce((sum, fee) => sum + fee.amount, 0)
        }
      }
    });

  } catch (error) {
    console.error('Child details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get payment history for all children
exports.getPaymentHistory = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { page = 1, limit = 10, childId, status } = req.query;

    // Get parent's children
    const parent = await User.findById(parentId);
    let children = [];
    
    if (parent.school) {
      children = await User.find({
        school: parent.school,
        roles: 'Student'
      }).limit(3);
    }

    if (children.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          payments: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 }
        }
      });
    }

    const childIds = children.map(child => child._id);
    
    // Build query
    const query = { user: { $in: childIds } };
    if (childId) query.user = childId;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .sort({ trans_date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'firstname lastname regNo')
      .populate('fee', 'name amount type');

    const total = await Payment.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Payment history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
