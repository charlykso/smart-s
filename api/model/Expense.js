const mongoose = require('mongoose')

const EXPENSE_STATUS = [
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'partially_paid',
  'paid',
]

const EXPENSE_TYPES = [
  'StaffSalary',
  'StaffAllowance',
  'VendorService',
  'Consumables',
  'FacilitiesMaintenance',
  'AcademicResources',
  'StudentActivities',
  'Transportation',
  'Technology',
  'Administrative',
  'Utilities',
  'CapitalProject',
  'Others',
]

const expenseSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
    term: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Term',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: EXPENSE_TYPES,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
      uppercase: true,
    },
    month: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: EXPENSE_STATUS,
      default: 'pending_approval',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

expenseSchema.virtual('payments', {
  ref: 'ExpensePayment',
  localField: '_id',
  foreignField: 'expense',
})

expenseSchema.index({ school: 1, month: 1 })
expenseSchema.index({ school: 1, type: 1, month: 1 })

expenseSchema.methods.isApproved = function () {
  return ['approved', 'partially_paid', 'paid'].includes(this.status)
}

module.exports = mongoose.model('Expense', expenseSchema)
module.exports.EXPENSE_TYPES = EXPENSE_TYPES
module.exports.EXPENSE_STATUS = EXPENSE_STATUS
