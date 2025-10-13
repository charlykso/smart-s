#!/usr/bin/env node
/**
 * Script: normalize-expense-status.js
 *
 * Ensures all Expense documents use canonical status values.
 * Converts legacy strings such as "Pending Approval" to
 * the API-standard snake_case form (e.g., "pending_approval").
 */

const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: process.env.ENV_PATH || '.env' })

const Expense = require('../model/Expense')

const normalizeStatus = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[-\s]+/g, '_')

const VALID_STATUSES = new Set([
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'partially_paid',
  'paid',
])

const run = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    process.env.DB_URI

  if (!uri) {
    console.error('❌ Missing MongoDB connection string (set MONGO_URI).')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  const expenses = await Expense.find({})
  let updated = 0

  await Promise.all(
    expenses.map(async (expense) => {
      const normalized = normalizeStatus(expense.status)
      if (!normalized || !VALID_STATUSES.has(normalized)) {
        console.warn(
          `Skipping expense ${expense._id}: unsupported status "${expense.status}"`
        )
        return
      }

      if (expense.status !== normalized) {
        expense.status = normalized
        await expense.save({ validateBeforeSave: false })
        updated += 1
      }
    })
  )

  console.log(`✅ Normalization complete. Updated ${updated} expense(s).`)
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((error) => {
  console.error('❌ Status normalization failed:', error)
  mongoose.disconnect().finally(() => process.exit(1))
})
