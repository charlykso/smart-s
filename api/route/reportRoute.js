const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const { filterByUserSchool } = require('../middleware/auth');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles');
const User = require('../model/User');
const Fee = require('../model/Fee');
const Payment = require('../model/Payment');
const School = require('../model/School');

const router = express.Router();

// Get financial summary report
router.get('/financial-summary', 
  authenticateToken,
  verifyRoles(
    roleList.Admin,
    roleList.ICT_administrator,
    roleList.Principal,
    roleList.Bursar,
    roleList.Auditor
  ),
  filterByUserSchool,
  async (req, res) => {
    try {
      const userSchool = req.user.school?._id || req.user.school;
      const userRoles = req.user.roles || [];

      // Build query based on user role
      let schoolQuery = {};
      if (!userRoles.includes('Admin') || userSchool) {
        if (!userSchool) {
          return res.status(400).json({
            success: false,
            message: 'User not assigned to a school',
          });
        }
        schoolQuery.school = userSchool;
      }

      // Get fee statistics
      const totalFees = await Fee.countDocuments(schoolQuery);
      const approvedFees = await Fee.countDocuments({ ...schoolQuery, isApproved: true });
      const pendingFees = await Fee.countDocuments({ ...schoolQuery, isApproved: false });
      
      // Calculate total fee amounts
      const totalFeeAmount = await Fee.aggregate([
        { $match: schoolQuery },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const approvedFeeAmount = await Fee.aggregate([
        { $match: { ...schoolQuery, isApproved: true } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Get payment statistics
      const payments = await Payment.find()
        .populate({
          path: 'fee',
          match: schoolQuery,
          select: 'school amount'
        });

      const validPayments = payments.filter(p => p.fee !== null);
      
      const totalPayments = validPayments.length;
      const successfulPayments = validPayments.filter(p => p.status === 'success').length;
      const totalRevenue = validPayments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const outstandingAmount = (approvedFeeAmount[0]?.total || 0) - totalRevenue;

      res.json({
        success: true,
        data: {
          fees: {
            total: totalFees,
            approved: approvedFees,
            pending: pendingFees,
            totalAmount: totalFeeAmount[0]?.total || 0,
            approvedAmount: approvedFeeAmount[0]?.total || 0,
          },
          payments: {
            total: totalPayments,
            successful: successfulPayments,
            failed: totalPayments - successfulPayments,
            totalRevenue,
          },
          financial: {
            totalRevenue,
            outstandingAmount,
            collectionRate: approvedFeeAmount[0]?.total > 0 
              ? ((totalRevenue / approvedFeeAmount[0].total) * 100).toFixed(2)
              : 0,
          }
        },
      });
    } catch (error) {
      console.error('Financial summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating financial summary',
      });
    }
  }
);

// Get payment analysis report
router.get('/payment-analysis',
  authenticateToken,
  verifyRoles(
    roleList.Admin,
    roleList.ICT_administrator,
    roleList.Principal,
    roleList.Bursar,
    roleList.Auditor
  ),
  filterByUserSchool,
  async (req, res) => {
    try {
      const userSchool = req.user.school?._id || req.user.school;
      const userRoles = req.user.roles || [];

      // Build query based on user role
      let schoolQuery = {};
      if (!userRoles.includes('Admin') || userSchool) {
        if (!userSchool) {
          return res.status(400).json({
            success: false,
            message: 'User not assigned to a school',
          });
        }
        schoolQuery.school = userSchool;
      }

      // Get payments with fee population
      const payments = await Payment.find()
        .populate({
          path: 'fee',
          match: schoolQuery,
          select: 'school amount name'
        })
        .populate('user', 'firstname lastname email');

      const validPayments = payments.filter(p => p.fee !== null);

      // Analyze payment methods
      const paymentsByMethod = {
        paystack: validPayments.filter(p => p.mode_of_payment === 'paystack').length,
        flutterwave: validPayments.filter(p => p.mode_of_payment === 'flutterwave').length,
        bank_transfer: validPayments.filter(p => p.mode_of_payment === 'bank_transfer').length,
        cash: validPayments.filter(p => p.mode_of_payment === 'cash').length,
      };

      // Analyze payment status
      const paymentsByStatus = {
        success: validPayments.filter(p => p.status === 'success').length,
        pending: validPayments.filter(p => p.status === 'pending').length,
        failed: validPayments.filter(p => p.status === 'failed').length,
      };

      // Recent payments
      const recentPayments = validPayments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      res.json({
        success: true,
        data: {
          totalPayments: validPayments.length,
          paymentsByMethod,
          paymentsByStatus,
          recentPayments: recentPayments.map(p => ({
            _id: p._id,
            amount: p.amount,
            status: p.status,
            mode_of_payment: p.mode_of_payment,
            trans_date: p.trans_date,
            user: p.user,
            fee: p.fee,
          })),
        },
      });
    } catch (error) {
      console.error('Payment analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating payment analysis',
      });
    }
  }
);

// Get student enrollment report
router.get('/student-enrollment',
  authenticateToken,
  verifyRoles(
    roleList.Admin,
    roleList.ICT_administrator,
    roleList.Principal,
    roleList.Teacher,
    roleList.Auditor
  ),
  filterByUserSchool,
  async (req, res) => {
    try {
      const userSchool = req.user.school?._id || req.user.school;
      const userRoles = req.user.roles || [];

      // Build query based on user role
      let query = { roles: 'Student' };
      if (!userRoles.includes('Admin') || userSchool) {
        if (!userSchool) {
          return res.status(400).json({
            success: false,
            message: 'User not assigned to a school',
          });
        }
        query.school = userSchool;
      }

      const totalStudents = await User.countDocuments(query);
      const activeStudents = await User.countDocuments({ ...query, isActive: true });
      const maleStudents = await User.countDocuments({ ...query, gender: 'Male' });
      const femaleStudents = await User.countDocuments({ ...query, gender: 'Female' });

      // Get students by class (if class information is available)
      const studentsByClass = await User.aggregate([
        { $match: query },
        { $group: { _id: '$classArm', count: { $sum: 1 } } },
        { $lookup: { from: 'classarms', localField: '_id', foreignField: '_id', as: 'classInfo' } },
        { $project: { className: { $arrayElemAt: ['$classInfo.name', 0] }, count: 1 } },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          totalStudents,
          activeStudents,
          inactiveStudents: totalStudents - activeStudents,
          maleStudents,
          femaleStudents,
          studentsByClass: studentsByClass.map(item => ({
            className: item.className || 'Unassigned',
            count: item.count
          })),
        },
      });
    } catch (error) {
      console.error('Student enrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating student enrollment report',
      });
    }
  }
);

module.exports = router;
