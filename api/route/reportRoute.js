const express = require('express')
const authenticateToken = require('../middleware/authenticateToken')
const { filterByUserSchool } = require('../middleware/auth')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const User = require('../model/User')
const Fee = require('../model/Fee')
const Payment = require('../model/Payment')
const School = require('../model/School')
const Expense = require('../model/Expense')
const ExpensePayment = require('../model/ExpensePayment')
const PDFDocument = require('pdfkit')
const ExcelJS = require('exceljs')

const buildHttpError = (status, message) => {
  const error = new Error(message)
  error.status = status
  return error
}

const formatDateForFilename = (date = new Date()) =>
  date.toISOString().replaceAll(':', '-').replaceAll('.', '-')

const prettifyKey = (key) =>
  key
    .replaceAll('_', ' ')
    .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (s) => s.toUpperCase())

const formatMetricValue = (value) => {
  if (typeof value === 'number') {
    return value.toLocaleString('en-NG', { maximumFractionDigits: 2 })
  }
  return String(value ?? '')
}

const buildFinancialSections = (data) => [
  ['Fees Overview', data.fees],
  ['Payments Overview', data.payments],
  ['Expense Overview', data.expenses],
  ['Financial Health', data.financial],
]

const streamFinancialSummaryPdf = (res, data) => {
  const sections = buildFinancialSections(data)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=financial_summary_${formatDateForFilename()}.pdf`
  )

  const doc = new PDFDocument({ margin: 40 })
  doc.pipe(res)

  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('Financial Summary Report', { align: 'center' })
  doc.moveDown(0.5)
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
  doc.moveDown(1)

  for (const [title, section] of sections) {
    doc.fontSize(14).font('Helvetica-Bold').text(title)
    doc.moveDown(0.4)
    for (const [key, value] of Object.entries(section)) {
      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`${prettifyKey(key)}: ${formatMetricValue(value)}`)
    }
    doc.moveDown(0.8)
  }

  doc.end()
}

const streamFinancialSummaryExcel = async (res, data) => {
  const sections = buildFinancialSections(data)
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Financial Summary')

  worksheet.columns = [
    { header: 'Section', key: 'section', width: 26 },
    { header: 'Metric', key: 'metric', width: 32 },
    { header: 'Value', key: 'value', width: 24 },
  ]

  for (const [title, section] of sections) {
    const titleRow = worksheet.addRow({ section: title })
    titleRow.font = { bold: true }
    for (const [key, value] of Object.entries(section)) {
      worksheet.addRow({
        section: '',
        metric: prettifyKey(key),
        value: typeof value === 'number' ? value : formatMetricValue(value),
      })
    }
    worksheet.addRow({ section: '', metric: '', value: '' })
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=financial_summary_${formatDateForFilename()}.xlsx`
  )

  const buffer = await workbook.xlsx.writeBuffer()
  res.send(Buffer.from(buffer))
}

const streamFinancialSummaryCsv = (res, data) => {
  const sections = buildFinancialSections(data)
  const rows = [['Section', 'Metric', 'Value']]

  const escapeCsv = (value) => {
    const stringValue = value == null ? '' : String(value)
    if (stringValue.includes('"')) {
      return `"${stringValue.replaceAll('"', '""')}"`
    }
    if (stringValue.includes(',') || stringValue.includes('\n')) {
      return `"${stringValue}"`
    }
    return stringValue
  }

  for (const [title, section] of sections) {
    for (const [key, value] of Object.entries(section)) {
      rows.push([
        escapeCsv(title),
        escapeCsv(prettifyKey(key)),
        escapeCsv(formatMetricValue(value)),
      ])
    }
  }

  const csvContent = rows.map((row) => row.join(',')).join('\n')
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=financial_summary_${formatDateForFilename()}.csv`
  )
  res.send(csvContent)
}

const getFinancialSummaryData = async (req) => {
  const userSchool = req.user.school?._id || req.user.school
  const userRoles = req.user.roles || []

  // Build query based on user role
  let schoolQuery = {}
  if (!userRoles.includes('Admin') || userSchool) {
    if (!userSchool) {
      throw buildHttpError(400, 'User not assigned to a school')
    }
    schoolQuery.school = userSchool
  }

  // Get fee statistics
  const [
    totalFees,
    approvedFees,
    pendingFees,
    totalFeeAmountAgg,
    approvedFeeAmountAgg,
  ] = await Promise.all([
    Fee.countDocuments(schoolQuery),
    Fee.countDocuments({ ...schoolQuery, isApproved: true }),
    Fee.countDocuments({ ...schoolQuery, isApproved: false }),
    Fee.aggregate([
      { $match: schoolQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Fee.aggregate([
      { $match: { ...schoolQuery, isApproved: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ])

  // Get payment statistics
  const payments = await Payment.find().populate({
    path: 'fee',
    match: schoolQuery,
    select: 'school amount',
  })

  const validPayments = payments.filter((p) => p.fee !== null)

  const totalPayments = validPayments.length
  const successfulPayments = validPayments.filter(
    (p) => p.status === 'success'
  ).length
  const totalRevenue = validPayments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const approvedFeeAmount = approvedFeeAmountAgg[0]?.total || 0
  const totalFeeAmount = totalFeeAmountAgg[0]?.total || 0
  const outstandingAmount = approvedFeeAmount - totalRevenue
  const collectionRate =
    approvedFeeAmount > 0
      ? Number(((totalRevenue / approvedFeeAmount) * 100).toFixed(2))
      : 0

  // Expense statistics
  const expenseQuery = { ...schoolQuery }
  const expenseStatusForApproval = ['approved', 'partially_paid', 'paid']
  const approvedExpenseStatuses = ['approved', 'partially_paid', 'paid']

  const [
    totalExpenses,
    approvedExpenses,
    partiallyPaidExpenses,
    paidExpenses,
    pendingExpenseApprovals,
    totalExpenseAmountAgg,
    approvedExpenseAmountAgg,
  ] = await Promise.all([
    Expense.countDocuments(expenseQuery),
    Expense.countDocuments({
      ...expenseQuery,
      status: { $in: approvedExpenseStatuses },
    }),
    Expense.countDocuments({ ...expenseQuery, status: 'partially_paid' }),
    Expense.countDocuments({ ...expenseQuery, status: 'paid' }),
    Expense.countDocuments({ ...expenseQuery, status: 'pending_approval' }),
    Expense.aggregate([
      { $match: expenseQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      {
        $match: { ...expenseQuery, status: { $in: expenseStatusForApproval } },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ])

  const expensePaymentMatch = {}
  if (expenseQuery.school) {
    expensePaymentMatch.school = expenseQuery.school
  }

  const expensePaymentTotals = await ExpensePayment.aggregate([
    { $match: expensePaymentMatch },
    { $group: { _id: null, total: { $sum: '$amountPaid' } } },
  ])

  const totalExpenseAmount = totalExpenseAmountAgg[0]?.total || 0
  const approvedExpenseAmount = approvedExpenseAmountAgg[0]?.total || 0
  const expensePaidAmount = expensePaymentTotals[0]?.total || 0
  const expenseOutstanding = Math.max(
    approvedExpenseAmount - expensePaidAmount,
    0
  )
  const netCashFlow = totalRevenue - expensePaidAmount

  return {
    fees: {
      total: totalFees,
      approved: approvedFees,
      pending: pendingFees,
      totalAmount: totalFeeAmount,
      approvedAmount: approvedFeeAmount,
    },
    payments: {
      total: totalPayments,
      successful: successfulPayments,
      failed: totalPayments - successfulPayments,
      totalRevenue,
    },
    expenses: {
      total: totalExpenses,
      approved: approvedExpenses,
      partiallyPaid: partiallyPaidExpenses,
      paid: paidExpenses,
      pendingApproval: pendingExpenseApprovals,
      totalAmount: totalExpenseAmount,
      approvedAmount: approvedExpenseAmount,
      paidAmount: expensePaidAmount,
      outstandingAmount: expenseOutstanding,
    },
    financial: {
      totalRevenue,
      outstandingAmount,
      collectionRate,
      expenseSpend: expensePaidAmount,
      expenseOutstanding,
      netCashFlow,
    },
  }
}

const router = express.Router()

// Get financial summary report
router.get(
  '/financial-summary',
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
      const data = await getFinancialSummaryData(req)
      res.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Financial summary error:', error)
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error generating financial summary',
      })
    }
  }
)

router.get(
  '/financial-summary/export',
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
      const format = (req.query.format || 'pdf').toString().toLowerCase()
      const data = await getFinancialSummaryData(req)

      if (format === 'pdf') {
        return streamFinancialSummaryPdf(res, data)
      }

      if (format === 'excel' || format === 'xlsx') {
        return streamFinancialSummaryExcel(res, data)
      }

      if (format === 'csv') {
        return streamFinancialSummaryCsv(res, data)
      }

      return res.status(400).json({
        success: false,
        message: 'Unsupported export format',
      })
    } catch (error) {
      console.error('Financial summary export error:', error)
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to export financial summary',
      })
    }
  }
)

// Get payment analysis report
router.get(
  '/payment-analysis',
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
      const userSchool = req.user.school?._id || req.user.school
      const userRoles = req.user.roles || []

      // Build query based on user role
      let schoolQuery = {}
      if (!userRoles.includes('Admin') || userSchool) {
        if (!userSchool) {
          return res.status(400).json({
            success: false,
            message: 'User not assigned to a school',
          })
        }
        schoolQuery.school = userSchool
      }

      // Get payments with fee population
      const payments = await Payment.find()
        .populate({
          path: 'fee',
          match: schoolQuery,
          select: 'school amount name',
        })
        .populate('user', 'firstname lastname email')

      const validPayments = payments.filter((p) => p.fee !== null)

      // Analyze payment methods
      const paymentsByMethod = {
        paystack: validPayments.filter((p) => p.mode_of_payment === 'paystack')
          .length,
        flutterwave: validPayments.filter(
          (p) => p.mode_of_payment === 'flutterwave'
        ).length,
        bank_transfer: validPayments.filter(
          (p) => p.mode_of_payment === 'bank_transfer'
        ).length,
        cash: validPayments.filter((p) => p.mode_of_payment === 'cash').length,
      }

      // Analyze payment status
      const paymentsByStatus = {
        success: validPayments.filter((p) => p.status === 'success').length,
        pending: validPayments.filter((p) => p.status === 'pending').length,
        failed: validPayments.filter((p) => p.status === 'failed').length,
      }

      // Recent payments
      const recentPayments = validPayments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)

      res.json({
        success: true,
        data: {
          totalPayments: validPayments.length,
          paymentsByMethod,
          paymentsByStatus,
          recentPayments: recentPayments.map((p) => ({
            _id: p._id,
            amount: p.amount,
            status: p.status,
            mode_of_payment: p.mode_of_payment,
            trans_date: p.trans_date,
            user: p.user,
            fee: p.fee,
          })),
        },
      })
    } catch (error) {
      console.error('Payment analysis error:', error)
      res.status(500).json({
        success: false,
        message: 'Error generating payment analysis',
      })
    }
  }
)

// Get student enrollment report
router.get(
  '/student-enrollment',
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
      const userSchool = req.user.school?._id || req.user.school
      const userRoles = req.user.roles || []

      // Build query based on user role
      let query = { roles: 'Student' }
      if (!userRoles.includes('Admin') || userSchool) {
        if (!userSchool) {
          return res.status(400).json({
            success: false,
            message: 'User not assigned to a school',
          })
        }
        query.school = userSchool
      }

      const totalStudents = await User.countDocuments(query)
      const activeStudents = await User.countDocuments({
        ...query,
        isActive: true,
      })
      const maleStudents = await User.countDocuments({
        ...query,
        gender: 'Male',
      })
      const femaleStudents = await User.countDocuments({
        ...query,
        gender: 'Female',
      })

      // Get students by class (if class information is available)
      const studentsByClass = await User.aggregate([
        { $match: query },
        { $group: { _id: '$classArm', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'classarms',
            localField: '_id',
            foreignField: '_id',
            as: 'classInfo',
          },
        },
        {
          $project: {
            className: { $arrayElemAt: ['$classInfo.name', 0] },
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ])

      res.json({
        success: true,
        data: {
          totalStudents,
          activeStudents,
          inactiveStudents: totalStudents - activeStudents,
          maleStudents,
          femaleStudents,
          studentsByClass: studentsByClass.map((item) => ({
            className: item.className || 'Unassigned',
            count: item.count,
          })),
        },
      })
    } catch (error) {
      console.error('Student enrollment error:', error)
      res.status(500).json({
        success: false,
        message: 'Error generating student enrollment report',
      })
    }
  }
)

module.exports = router
