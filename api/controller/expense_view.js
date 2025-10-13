const PDFDocument = require('pdfkit')
const Expense = require('../model/Expense')
const ExpensePayment = require('../model/ExpensePayment')
const School = require('../model/School')

const { EXPENSE_TYPES, EXPENSE_STATUS } = Expense

const SUMMARIZABLE_STATUS = ['approved', 'partially_paid', 'paid']

const normalizeStatus = (status) =>
  String(status || '')
    .toLowerCase()
    .replace(/[-\s]+/g, '_')

const buildExpenseQuery = (req) => {
  const query = {}

  if (req.schoolFilter) {
    Object.assign(query, req.schoolFilter)
  }

  if (req.query.schoolId) {
    query.school = req.query.schoolId
  }

  if (req.query.status && EXPENSE_STATUS.includes(req.query.status)) {
    query.status = req.query.status
  }

  if (req.query.type && EXPENSE_TYPES.includes(req.query.type)) {
    query.type = req.query.type
  }

  if (req.query.month) {
    query.month = req.query.month
  }

  if (req.query.from || req.query.to) {
    query.expenseDate = {}
    if (req.query.from) {
      query.expenseDate.$gte = new Date(req.query.from)
    }
    if (req.query.to) {
      query.expenseDate.$lte = new Date(req.query.to)
    }
  }

  return query
}

const calculateAmountPaid = async (expenseId) => {
  const result = await ExpensePayment.aggregate([
    { $match: { expense: expenseId } },
    {
      $group: {
        _id: '$expense',
        totalPaid: { $sum: '$amountPaid' },
      },
    },
  ])

  return result[0]?.totalPaid || 0
}

const updateExpensePaymentStatus = async (expense) => {
  const totalPaid = await calculateAmountPaid(expense._id)
  if (!SUMMARIZABLE_STATUS.includes(expense.status)) {
    // Only move to partial/paid when previously approved
    return { totalPaid, status: expense.status }
  }

  let nextStatus

  if (totalPaid <= 0) {
    nextStatus = 'approved'
  } else if (totalPaid < expense.amount) {
    nextStatus = 'partially_paid'
  } else {
    nextStatus = 'paid'
  }

  if (nextStatus !== expense.status) {
    expense.status = nextStatus
    await expense.save({ validateBeforeSave: false })
  } else {
    nextStatus = expense.status
  }

  return { totalPaid, status: nextStatus }
}

exports.getExpenses = async (req, res) => {
  try {
    const query = buildExpenseQuery(req)
    const expenses = await Expense.find(query)
      .populate('school', 'name')
      .populate('session', 'name')
      .populate('term', 'name')
      .populate('createdBy', 'firstname lastname email roles')
      .populate('approvedBy', 'firstname lastname email roles')
      .sort({ expenseDate: -1 })

    const includeTotals = req.query.includeTotals === 'true'

    if (!includeTotals) {
      return res.json({ success: true, data: expenses })
    }

    const totals = await ExpensePayment.aggregate([
      { $match: { expense: { $in: expenses.map((item) => item._id) } } },
      {
        $group: {
          _id: '$expense',
          totalPaid: { $sum: '$amountPaid' },
        },
      },
    ])

    const totalsMap = totals.reduce((acc, entry) => {
      acc[entry._id.toString()] = entry.totalPaid
      return acc
    }, {})

    const data = expenses.map((expense) => {
      const totalPaid = totalsMap[expense._id.toString()] || 0
      return {
        ...expense.toObject(),
        totalPaid,
        balance: Math.max(0, expense.amount - totalPaid),
      }
    })

    res.json({ success: true, data })
  } catch (error) {
    console.error('getExpenses error:', error)
    res.status(500).json({ success: false, message: 'Failed to load expenses' })
  }
}

exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('school', 'name')
      .populate('session', 'name')
      .populate('term', 'name')
      .populate('createdBy', 'firstname lastname email roles')
      .populate('approvedBy', 'firstname lastname email roles')

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' })
    }

    const totalPaid = await calculateAmountPaid(expense._id)

    res.json({
      success: true,
      data: {
        ...expense.toObject(),
        totalPaid,
        balance: Math.max(0, expense.amount - totalPaid),
      },
    })
  } catch (error) {
    console.error('getExpense error:', error)
    res.status(500).json({ success: false, message: 'Failed to load expense' })
  }
}

exports.createExpense = async (req, res) => {
  try {
    const {
      school,
      session,
      term,
      title,
      description,
      type,
      amount,
      currency,
      month,
      expenseDate,
      notes,
      attachments,
    } = req.body

    const schoolId = school || req.userSchool || req.body.schoolId

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School is required for expense creation',
      })
    }

    if (req.userSchool && String(req.userSchool) !== String(schoolId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage expenses for your assigned school',
      })
    }

    const amountValue = Number(amount)
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid amount greater than zero is required',
      })
    }

    const expense = await Expense.create({
      school: schoolId,
      session,
      term,
      title,
      description,
      type,
      amount: amountValue,
      currency: currency || 'NGN',
      month,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      notes,
      attachments,
      createdBy: req.user._id,
    })

    const populatedExpense = await expense.populate([
      { path: 'school', select: 'name' },
      { path: 'session', select: 'name' },
      { path: 'term', select: 'name' },
      {
        path: 'createdBy',
        select: 'firstname lastname email roles',
      },
    ])

    res.status(201).json({
      success: true,
      data: populatedExpense,
      message: 'Expense created successfully',
    })
  } catch (error) {
    console.error('createExpense error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create expense',
    })
  }
}

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' })
    }

    if (req.userSchool && String(expense.school) !== String(req.userSchool)) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage expenses for your assigned school',
      })
    }

    const updatableFields = [
      'session',
      'term',
      'title',
      'description',
      'type',
      'amount',
      'currency',
      'month',
      'expenseDate',
      'notes',
      'attachments',
    ]

    updatableFields.forEach((field) => {
      if (req.body[field] != null) {
        if (field === 'amount') {
          const amountValue = Number(req.body[field])
          if (Number.isNaN(amountValue) || amountValue <= 0) {
            throw new Error('A valid amount greater than zero is required')
          }
          expense[field] = amountValue
        } else if (field === 'expenseDate') {
          expense[field] = new Date(req.body[field])
        } else if (field === 'currency') {
          expense[field] = String(req.body[field] || 'NGN').toUpperCase()
        } else {
          expense[field] = req.body[field]
        }
      }
    })

    expense.updatedBy = req.user._id

    const saved = await expense.save()

    await updateExpensePaymentStatus(saved)

    const populatedExpense = await saved
      .populate('school', 'name')
      .populate('session', 'name')
      .populate('term', 'name')
      .populate('createdBy', 'firstname lastname email roles')
      .populate('approvedBy', 'firstname lastname email roles')

    const totalPaid = await calculateAmountPaid(saved._id)

    res.json({
      success: true,
      data: {
        ...populatedExpense.toObject(),
        totalPaid,
        balance: Math.max(0, populatedExpense.amount - totalPaid),
      },
      message: 'Expense updated successfully',
    })
  } catch (error) {
    console.error('updateExpense error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update expense',
    })
  }
}

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params

    const expense = await Expense.findById(id)
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' })
    }

    if (req.userSchool && String(expense.school) !== String(req.userSchool)) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage expenses for your assigned school',
      })
    }

    const paymentsCount = await ExpensePayment.countDocuments({ expense: id })
    if (paymentsCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete expense with recorded payments',
      })
    }

    await expense.deleteOne()

    res.json({ success: true, message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('deleteExpense error:', error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete expense' })
  }
}

exports.approveExpense = async (req, res) => {
  try {
    const { id } = req.params
    const expense = await Expense.findById(id)

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' })
    }

    if (req.userSchool && String(expense.school) !== String(req.userSchool)) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve expenses for your assigned school',
      })
    }

    const normalizedStatus = normalizeStatus(expense.status)

    if (!['pending_approval', 'rejected'].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Expense is not pending approval',
      })
    }

    if (expense.status !== normalizedStatus) {
      expense.status = normalizedStatus
    }

    expense.status = 'approved'
    expense.approvedBy = req.user._id
    expense.approvedAt = new Date()
    expense.updatedBy = req.user._id

    await expense.save({ validateBeforeSave: false })

    await expense.populate([
      { path: 'school', select: 'name' },
      { path: 'session', select: 'name' },
      { path: 'term', select: 'name' },
      { path: 'createdBy', select: 'firstname lastname email roles' },
      { path: 'approvedBy', select: 'firstname lastname email roles' },
    ])

    res.json({
      success: true,
      data: expense,
      message: 'Expense approved successfully',
    })
  } catch (error) {
    console.error('approveExpense error:', error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to approve expense' })
  }
}

exports.rejectExpense = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const expense = await Expense.findById(id)

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' })
    }

    if (req.userSchool && String(expense.school) !== String(req.userSchool)) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject expenses for your assigned school',
      })
    }

    const normalizedStatus = normalizeStatus(expense.status)

    if (
      !['pending_approval', 'approved', 'partially_paid'].includes(
        normalizedStatus
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Expense cannot be rejected' })
    }

    if (expense.status !== normalizedStatus) {
      expense.status = normalizedStatus
    }

    const paymentsCount = await ExpensePayment.countDocuments({ expense: id })
    if (paymentsCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot reject expense with existing payments',
      })
    }

    expense.status = 'rejected'
    expense.updatedBy = req.user._id
    expense.approvedBy = undefined
    expense.approvedAt = undefined
    if (reason) {
      expense.notes = expense.notes
        ? `${expense.notes}\nRejection: ${reason}`
        : `Rejection: ${reason}`
    }

    await expense.save({ validateBeforeSave: false })

    await expense.populate([
      { path: 'school', select: 'name' },
      { path: 'session', select: 'name' },
      { path: 'term', select: 'name' },
      { path: 'createdBy', select: 'firstname lastname email roles' },
    ])

    res.json({
      success: true,
      data: expense,
      message: 'Expense rejected successfully',
    })
  } catch (error) {
    console.error('rejectExpense error:', error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to reject expense' })
  }
}

exports.getExpenseSummary = async (req, res) => {
  try {
    const query = buildExpenseQuery(req)

    const summary = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            month: '$month',
            type: '$type',
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.month',
          expenses: {
            $push: {
              type: '$_id.type',
              totalAmount: '$totalAmount',
              count: '$count',
            },
          },
          monthTotal: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: -1 } },
    ])

    res.json({ success: true, data: summary })
  } catch (error) {
    console.error('getExpenseSummary error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch summary' })
  }
}

exports.exportExpensesPdf = async (req, res) => {
  try {
    const query = buildExpenseQuery(req)
    const expenses = await Expense.find(query)
      .populate('school', 'name address')
      .sort({ expenseDate: 1 })

    if (!expenses.length) {
      return res
        .status(404)
        .json({ success: false, message: 'No expenses found' })
    }

    const school = await School.findById(expenses[0].school)

    const doc = new PDFDocument({ margin: 40 })
    const fileName = `expenses_${new Date().toISOString()}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

    doc.pipe(res)

    doc
      .fontSize(18)
      .text(school ? school.name : 'School Expenses', { align: 'center' })

    doc.moveDown(0.5)
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`)
    if (req.query.from || req.query.to) {
      doc.text(
        `Period: ${req.query.from || 'Start'} - ${req.query.to || 'Present'}`
      )
    }

    doc.moveDown(1)

    const tableHeader = ['Date', 'Title', 'Type', 'Amount (NGN)', 'Status']

    const drawRow = (row, isHeader = false) => {
      const y = doc.y
      const columnWidths = [100, 180, 100, 100, 80]
      const columns = row
      doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
      columns.forEach((text, i) => {
        doc.text(
          String(text),
          40 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
          y,
          {
            width: columnWidths[i],
          }
        )
      })
      doc.moveDown(1)
    }

    drawRow(tableHeader, true)
    doc
      .moveTo(40, doc.y - 5)
      .lineTo(540, doc.y - 5)
      .stroke()

    let totalAmount = 0
    let paidAmount = 0
    const totalsByType = {}

    expenses.forEach((expense) => {
      totalAmount += expense.amount
      totalsByType[expense.type] =
        (totalsByType[expense.type] || 0) + expense.amount

      if (normalizeStatus(expense.status) === 'paid') {
        paidAmount += expense.amount
      }

      drawRow([
        new Date(expense.expenseDate).toLocaleDateString(),
        expense.title,
        expense.type,
        expense.amount.toLocaleString(),
        expense.status,
      ])
    })

    const unpaidAmount = totalAmount - paidAmount

    doc.moveDown(1.5)

    const summaryWidth = 220
    const summaryX = (doc.page.width - summaryWidth) / 2

    doc
      .font('Helvetica-Bold')
      .text('Summary', summaryX, doc.y, {
        width: summaryWidth,
        align: 'center',
      })

    doc
      .moveDown(0.3)
      .font('Helvetica-Bold')
      .text('Total Amount', summaryX, doc.y, {
        width: summaryWidth,
        align: 'center',
      })

    doc
      .font('Helvetica')
      .text(`NGN ${totalAmount.toLocaleString()}`, summaryX, doc.y, {
        width: summaryWidth,
        align: 'center',
      })

    doc.moveDown(0.5)
    doc
      .font('Helvetica-Bold')
      .text('Totals', summaryX, doc.y, { width: summaryWidth, align: 'center' })

    doc
      .font('Helvetica')
      .text(`Paid: NGN ${paidAmount.toLocaleString()}`, summaryX, doc.y, {
        width: summaryWidth,
        align: 'center',
      })

    doc.text(`Unpaid: NGN ${unpaidAmount.toLocaleString()}`, summaryX, doc.y, {
      width: summaryWidth,
      align: 'center',
    })

    doc.moveDown(0.5)
    doc.font('Helvetica-Bold').text('Breakdown by Type', summaryX, doc.y, {
      width: summaryWidth,
      align: 'center',
    })

    doc.font('Helvetica')
    Object.entries(totalsByType).forEach(([type, amount]) => {
      doc.text(`${type}: NGN ${amount.toLocaleString()}`, summaryX, doc.y, {
        width: summaryWidth,
        align: 'center',
      })
    })

    doc.end()
  } catch (error) {
    console.error('exportExpensesPdf error:', error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to export expenses' })
  }
}

exports.calculateAmountPaid = calculateAmountPaid
exports.updateExpensePaymentStatus = updateExpensePaymentStatus
