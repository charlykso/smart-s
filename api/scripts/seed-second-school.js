/*
  Seed a second demo school with its own users, fees and session/term
  Safe to run on an existing database (does not purge collections)
*/

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Models
const Address = require('../model/Address')
const GroupSchool = require('../model/GroupSchool')
const School = require('../model/School')
const Session = require('../model/Session')
const Term = require('../model/Term')
const ClassArm = require('../model/ClassArm')
const User = require('../model/User')
const Fee = require('../model/Fee')
const PaymentProfile = require('../model/PaymentProfile')
const Expense = require('../model/Expense')
const ExpensePayment = require('../model/ExpensePayment')
let Payment
try {
  Payment = require('../model/Payment')
} catch {
  Payment = null
}

async function connectDB() {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URI ||
    'mongodb://127.0.0.1:27017/smart_s'
  await mongoose.connect(uri)
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

async function seedSecondSchool() {
  await connectDB()

  // Reuse an existing group if present, otherwise create one
  let groupSchool = await GroupSchool.findOne()
  if (!groupSchool) {
    groupSchool = await GroupSchool.create({
      name: 'Ledgrio Education Group',
      description: 'Auto-created group for demo',
      logo: 'https://via.placeholder.com/200x200.png?text=Ledgrio+Group',
    })
  }

  // Create a distinct address
  const address = await Address.create({
    country: 'Nigeria',
    state: 'Abuja',
    town: 'Garki',
    street: 'Ahmadu Bello Way',
    zip_code: 900211,
    street_no: 22,
  })

  // Prevent duplicates by email and school name
  const existingSchool = await School.findOne({ name: 'Greenwood High School' })
  if (existingSchool) {
    console.log(
      'School "Greenwood High School" already exists. Exiting without changes.'
    )
    return process.exit(0)
  }

  // Create second school
  const school = await School.create({
    groupSchool: groupSchool._id,
    name: 'Greenwood High School',
    address: address._id,
    email: 'contact@greenwood.edu.ng',
    phoneNumber: '+2348012345678',
    isActive: true,
  })

  const now = new Date()
  const session = await Session.create({
    school: school._id,
    name: `${now.getFullYear()}/${now.getFullYear() + 1}`,
    startDate: addDays(now, -10),
    endDate: addDays(now, 320),
  })

  const term = await Term.create({
    session: session._id,
    name: 'First Term',
    startDate: addDays(now, -5),
    endDate: addDays(now, 95),
  })

  const classArms = await ClassArm.insertMany([
    { school: school._id, name: 'JSS2 A' },
    { school: school._id, name: 'JSS2 B' },
    { school: school._id, name: 'SS2 A' },
  ])

  const hash = (p) => bcrypt.hash(p, 12)

  const users = await User.insertMany([
    {
      email: 'principal@greenwood.edu.ng',
      password: await hash('password123'),
      firstname: 'Grace',
      lastname: 'Okoro',
      phone: '+2348000000001',
      roles: ['Principal'],
      school: school._id,
      isActive: true,
    },
    {
      email: 'bursar@greenwood.edu.ng',
      password: await hash('password123'),
      firstname: 'Kunle',
      lastname: 'Adebayo',
      phone: '+2348000000002',
      roles: ['Bursar'],
      school: school._id,
      isActive: true,
    },
    {
      email: 'ictadmin@greenwood.edu.ng',
      password: await hash('password123'),
      firstname: 'Ngozi',
      lastname: 'Eze',
      phone: '+2348000000003',
      roles: ['ICT_administrator'],
      school: school._id,
      isActive: true,
    },
    {
      email: 'auditor@greenwood.edu.ng',
      password: await hash('password123'),
      firstname: 'Tunde',
      lastname: 'Ajayi',
      phone: '+2348000000004',
      roles: ['Auditor'],
      school: school._id,
      isActive: true,
    },
    {
      email: 'student1@greenwood.edu.ng',
      password: await hash('password123'),
      firstname: 'Ada',
      lastname: 'Nnaji',
      phone: '+2348000000005',
      roles: ['Student'],
      school: school._id,
      classArm: classArms[0]._id,
      isActive: true,
      regNo: 'GW-001',
      gender: 'Female',
      type: 'day',
    },
    {
      email: 'parent1@greenwood.edu.ng',
      password: await hash('password123'),
      firstname: 'Mr',
      lastname: 'Nnaji',
      phone: '+2348000000006',
      roles: ['Parent'],
      school: school._id,
      isActive: true,
    },
  ])

  const fees = await Fee.insertMany([
    {
      term: term._id,
      school: school._id,
      name: 'Tuition',
      decription: 'Termly tuition',
      type: 'tuition',
      isActive: true,
      isInstallmentAllowed: false,
      no_ofInstallments: 1,
      amount: 65000,
      isApproved: true,
    },
    {
      term: term._id,
      school: school._id,
      name: 'Development Levy',
      decription: 'Infrastructure support',
      type: 'development',
      isActive: true,
      isInstallmentAllowed: false,
      no_ofInstallments: 1,
      amount: 10000,
      isApproved: true,
    },
  ])

  await PaymentProfile.create({
    school: school._id,
    activate_ps: false,
    activate_fw: false,
    account_no: '1111111111',
    account_name: 'Greenwood High School',
    bank_name: 'Demo Bank',
  })

  if (Payment) {
    await Payment.create({
      user: users.find((u) => u.roles.includes('Student'))._id,
      fee: fees[0]._id,
      amount: 65000,
      mode_of_payment: 'paystack',
      status: 'success',
      channel: 'web',
      paid_at: new Date(),
    })
  }

  const bursar = users.find((u) => u.roles.includes('Bursar')) || users[0]
  const principal = users.find((u) => u.roles.includes('Principal')) || users[0]
  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`

  const expense = await Expense.create({
    school: school._id,
    session: session._id,
    term: term._id,
    title: 'Laboratory Equipment Purchase',
    description: 'New microscopes and lab supplies',
    type: 'AcademicResources',
    amount: 150000,
    currency: 'NGN',
    month: currentMonth,
    expenseDate: now,
    status: 'approved',
    notes: 'Approved for science lab upgrades',
    createdBy: bursar._id,
    approvedBy: principal._id,
    approvedAt: new Date(),
  })

  await ExpensePayment.create({
    expense: expense._id,
    school: school._id,
    payeeType: 'Vendor',
    payeeName: 'Science Supplies Ltd',
    paymentDate: now,
    amountPaid: 75000,
    currency: 'NGN',
    paymentMethod: 'bank_transfer',
    transactionReference: 'GW-EXP-001',
    periodCovered: currentMonth,
    receiptUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    notes: 'First installment for lab equipment',
    breakdown: {
      allowances: 0,
      deductions: 0,
    },
    recordedBy: bursar._id,
  })

  expense.status = 'partially_paid'
  await expense.save({ validateBeforeSave: false })

  console.log('\n✅ Second school seeded successfully!')
  console.log('   School: Greenwood High School')
  console.log('   Principal: principal@greenwood.edu.ng / password123')
  console.log('   Bursar: bursar@greenwood.edu.ng / password123')
  console.log('   ICT Admin: ictadmin@greenwood.edu.ng / password123')
  console.log('   Auditor: auditor@greenwood.edu.ng / password123')
  console.log('   Student: student1@greenwood.edu.ng / password123')

  process.exit(0)
}

if (require.main === module) {
  seedSecondSchool().catch((err) => {
    console.error('❌ Seed second school error:', err)
    process.exit(1)
  })
}

module.exports = { seedSecondSchool }
