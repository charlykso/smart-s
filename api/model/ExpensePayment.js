const mongoose = require('mongoose')

const PAYEE_TYPES = ['Staff', 'Vendor', 'Other']

const PAYMENT_METHODS = [
  'bank_transfer',
  'cash',
  'cheque',
  'mobile_money',
  'other',
]

const expensePaymentSchema = new mongoose.Schema(
  {
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      required: true,
      index: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    payeeType: {
      type: String,
      enum: PAYEE_TYPES,
      required: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    payeeName: {
      type: String,
      required: true,
      trim: true,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: 'bank_transfer',
    },
    transactionReference: {
      type: String,
      trim: true,
    },
    periodCovered: {
      type: String,
      trim: true,
    },
    receiptUrl: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    breakdown: {
      allowances: {
        type: Number,
        default: 0,
        min: 0,
      },
      deductions: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
)

expensePaymentSchema.index({ expense: 1, paymentDate: -1 })
expensePaymentSchema.index({ school: 1, paymentDate: -1 })

module.exports = mongoose.model('ExpensePayment', expensePaymentSchema)
module.exports.PAYEE_TYPES = PAYEE_TYPES
module.exports.PAYMENT_METHODS = PAYMENT_METHODS
