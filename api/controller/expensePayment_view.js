const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const Expense = require('../model/Expense')
const ExpensePayment = require('../model/ExpensePayment')
const uploadToCloud = require('../helpers/uploadToCloud')
const {
  calculateAmountPaid,
  updateExpensePaymentStatus,
} = require('./expense_view')

const ensureReceiptUploaded = (req) => {
  if (!req.file) {
    const error = new Error('Payment receipt is required')
    error.statusCode = 400
    throw error
  }
}

const cleanupLocalFile = (filePath) => {
  if (!filePath) return
  fs.promises
    .unlink(filePath)
    .catch((err) => console.warn('Failed to cleanup upload:', err.message))
}

const canRecordPayment = (expense) => {
  return ['approved', 'partially_paid'].includes(expense.status)
}

exports.getPayments = async (req, res) => {
  try {
    const { expenseId } = req.params
    const query = {}

    if (req.schoolFilter) {
      Object.assign(query, req.schoolFilter)
    }

    if (expenseId) {
      query.expense = expenseId
    }

    if (req.query.payeeType) {
      query.payeeType = req.query.payeeType
    }

    if (req.query.from || req.query.to) {
      query.paymentDate = {}
      if (req.query.from) {
        query.paymentDate.$gte = new Date(req.query.from)
      }
      if (req.query.to) {
        query.paymentDate.$lte = new Date(req.query.to)
      }
    }

    const payments = await ExpensePayment.find(query)
      .populate('expense')
      .populate('payee', 'firstname lastname email roles')
      .populate('recordedBy', 'firstname lastname email roles')
      .sort({ paymentDate: -1 })

    res.json({ success: true, data: payments })
  } catch (error) {
    console.error('getPayments error:', error)
    res.status(500).json({ success: false, message: 'Failed to load payments' })
  }
}

exports.getPayment = async (req, res) => {
  try {
    const payment = await ExpensePayment.findById(req.params.id)
      .populate('expense')
      .populate('payee', 'firstname lastname email roles')
      .populate('recordedBy', 'firstname lastname email roles')

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found' })
    }

    if (req.userSchool && String(payment.school) !== String(req.userSchool)) {
      return res.status(403).json({
        success: false,
        message: 'You can only view payments for your assigned school',
      })
    }

    res.json({ success: true, data: payment })
  } catch (error) {
    console.error('getPayment error:', error)
    res.status(500).json({ success: false, message: 'Failed to load payment' })
  }
}

exports.createPayment = async (req, res) => {
  try {
    ensureReceiptUploaded(req)

    const { expenseId } = req.params
    const expense = await Expense.findById(expenseId)

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' })
    }

    if (req.userSchool && String(expense.school) !== String(req.userSchool)) {
      return res.status(403).json({
        success: false,
        message: 'You can only record payments for your assigned school',
      })
    }

    if (!canRecordPayment(expense)) {
      return res.status(400).json({
        success: false,
        message: 'Expense must be approved before recording payments',
      })
    }

    const {
      payeeType,
      payeeId,
      payeeName,
      paymentDate,
      amountPaid,
      currency,
      paymentMethod,
      transactionReference,
      periodCovered,
      notes,
      allowances,
      deductions,
    } = req.body

    const amountValue = Number(amountPaid)
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid payment amount is required',
      })
    }

    const allowanceValue = allowances != null ? Number(allowances) : 0
    const deductionValue = deductions != null ? Number(deductions) : 0

    const existingTotalPaid = await calculateAmountPaid(expense._id)
    if (existingTotalPaid + amountValue > expense.amount) {
      return res.status(400).json({
        success: false,
        message: 'Payment exceeds remaining balance for this expense',
      })
    }

    const uploadFolder = `expenses/${expense.school}`
    const publicId = `expense-${expense._id}-${Date.now()}`
    const receiptUrl = await uploadToCloud(
      req.file.path,
      'auto',
      uploadFolder,
      publicId
    )

    cleanupLocalFile(req.file.path)

    const payment = await ExpensePayment.create({
      expense: expense._id,
      school: expense.school,
      payeeType,
      payee: payeeId,
      payeeName,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      amountPaid: amountValue,
      currency: currency || 'NGN',
      paymentMethod,
      transactionReference:
        transactionReference?.trim() ||
        `EXP-${uuidv4().slice(0, 8).toUpperCase()}`,
      periodCovered,
      receiptUrl,
      notes,
      breakdown: {
        allowances: allowanceValue,
        deductions: deductionValue,
      },
      recordedBy: req.user._id,
    })

    await updateExpensePaymentStatus(expense)

    const populatedPayment = await payment.populate([
      { path: 'expense' },
      { path: 'payee', select: 'firstname lastname email roles' },
      { path: 'recordedBy', select: 'firstname lastname email roles' },
    ])

    const totalPaid = await calculateAmountPaid(expense._id)

    res.status(201).json({
      success: true,
      data: {
        payment: populatedPayment,
        totals: {
          totalPaid,
          balance: Math.max(0, expense.amount - totalPaid),
        },
      },
      message: 'Payment recorded successfully',
    })
  } catch (error) {
    console.error('createPayment error:', error)
    if (req.file) {
      cleanupLocalFile(req.file.path)
    }
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Failed to record payment',
    })
  }
}

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params
    const payment = await ExpensePayment.findById(id)

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found' })
    }

    const expense = await Expense.findById(payment.expense)
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' })
    }

    if (req.userSchool && String(expense.school) !== String(req.userSchool)) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage payments for your assigned school',
      })
    }

    const previousAmount = payment.amountPaid
    const existingTotalPaid = await calculateAmountPaid(expense._id)

    const updatableFields = [
      'payeeType',
      'payee',
      'payeeName',
      'paymentDate',
      'amountPaid',
      'currency',
      'paymentMethod',
      'transactionReference',
      'periodCovered',
      'notes',
    ]

    updatableFields.forEach((field) => {
      if (req.body[field] != null) {
        if (field === 'paymentDate') {
          payment[field] = new Date(req.body[field])
        } else if (field === 'amountPaid') {
          const amountValue = Number(req.body[field])
          if (Number.isNaN(amountValue) || amountValue <= 0) {
            throw new Error('A valid payment amount is required')
          }
          payment[field] = amountValue
        } else {
          payment[field] = req.body[field]
        }
      }
    })

    if (req.body.allowances != null || req.body.deductions != null) {
      const allowanceValue =
        req.body.allowances != null
          ? Number(req.body.allowances)
          : payment.breakdown.allowances
      const deductionValue =
        req.body.deductions != null
          ? Number(req.body.deductions)
          : payment.breakdown.deductions

      if (Number.isNaN(allowanceValue) || Number.isNaN(deductionValue)) {
        throw new Error('Invalid breakdown values provided')
      }

      payment.breakdown = {
        allowances: allowanceValue,
        deductions: deductionValue,
      }
    }

    const newTotal = existingTotalPaid - previousAmount + payment.amountPaid
    if (newTotal > expense.amount) {
      throw new Error('Payment exceeds remaining balance for this expense')
    }

    if (req.file) {
      const uploadFolder = `expenses/${expense.school}`
      const publicId = `expense-${expense._id}-${Date.now()}`
      const receiptUrl = await uploadToCloud(
        req.file.path,
        'auto',
        uploadFolder,
        publicId
      )
      cleanupLocalFile(req.file.path)
      payment.receiptUrl = receiptUrl
    }

    const saved = await payment.save()

    await updateExpensePaymentStatus(expense)

    const populatedPayment = await saved.populate([
      { path: 'expense' },
      { path: 'payee', select: 'firstname lastname email roles' },
      { path: 'recordedBy', select: 'firstname lastname email roles' },
    ])

    const totalPaid = await calculateAmountPaid(expense._id)

    res.json({
      success: true,
      data: {
        payment: populatedPayment,
        totals: {
          totalPaid,
          balance: Math.max(0, expense.amount - totalPaid),
        },
      },
      message: 'Payment updated successfully',
    })
  } catch (error) {
    console.error('updatePayment error:', error)
    if (req.file) {
      cleanupLocalFile(req.file.path)
    }
    res
      .status(400)
      .json({ success: false, message: 'Failed to update payment' })
  }
}

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params
    const payment = await ExpensePayment.findById(id)

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found' })
    }

    const expense = await Expense.findById(payment.expense)
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: 'Expense not found' })
    }

    if (req.userSchool && String(expense.school) !== String(req.userSchool)) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage payments for your assigned school',
      })
    }

    await payment.deleteOne()

    await updateExpensePaymentStatus(expense)

    const totalPaid = await calculateAmountPaid(expense._id)

    res.json({
      success: true,
      data: {
        totals: {
          totalPaid,
          balance: Math.max(0, expense.amount - totalPaid),
        },
      },
      message: 'Payment deleted successfully',
    })
  } catch (error) {
    console.error('deletePayment error:', error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete payment' })
  }
}

exports.calculateAmountPaid = calculateAmountPaid
