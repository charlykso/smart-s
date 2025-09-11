/*
  Reset and Seed Script (do not auto-run)
  - Purges core collections
  - Seeds GroupSchool, School, Address, Session, Term, ClassArms
  - Seeds Users for roles (Admin, ICT_admin, Principal, Bursar, Auditor, Student, Parent)
  - Seeds Fees for current Term
  - Seeds PaymentProfile (disabled by default)
  - NOTE: Payments are optional; create sample paid/pending entries if needed
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
let Payment
try { Payment = require('../model/Payment') } catch { Payment = null }

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/smart_s'
  await mongoose.connect(uri)
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

async function resetAndSeed() {
  await connectDB()

  // Purge order (respect refs)
  const collections = [
    'payments',
    'fees',
    'users',
    'classarms',
    'terms',
    'sessions',
    'schools',
    'groupschools',
    'addresses',
    'paymentprofiles',
  ]

  for (const name of collections) {
    if (mongoose.connection.collections[name]) {
      await mongoose.connection.collections[name].deleteMany({})
    }
  }

  // Address
  const address = await Address.create({
    country: 'Nigeria',
    state: 'Lagos',
    town: 'Ikeja',
    street: 'Adeola Odeku',
    zip_code: 100271,
    street_no: 12,
  })

  // Group School
  const groupSchool = await GroupSchool.create({
    name: 'Smart School Academy Group',
    description: 'Demo group for Smart-S',
    logo: 'https://via.placeholder.com/200x200.png?text=Smart+School+Group',
  })

  // School
  const school = await School.create({
    groupSchool: groupSchool._id,
    name: 'Smart School Academy',
    address: address._id,
    email: 'school@smart-s.com',
    phoneNumber: '+2348000000000',
    isActive: true,
  })

  // Session & Term
  const now = new Date()
  const session = await Session.create({
    school: school._id,
    name: `${now.getFullYear()}/${now.getFullYear() + 1}`,
    startDate: addDays(now, -30),
    endDate: addDays(now, 300),
  })

  const term1 = await Term.create({
    session: session._id,
    name: 'First Term',
    startDate: addDays(now, -20),
    endDate: addDays(now, 80),
  })

  // Class Arms
  const classArms = await ClassArm.insertMany([
    { school: school._id, name: 'JSS1 A' },
    { school: school._id, name: 'JSS1 B' },
    { school: school._id, name: 'SS1 A' },
  ])

  // Users
  const hash = (p) => bcrypt.hash(p, 12)

  const usersData = [
    { email: 'admin@ledgrio.com', password: await hash('KGnd#%$ld'), firstname: 'System', lastname: 'Administrator', phone: '+1234567890', roles: ['Admin'], isActive: true },
    { email: 'ictadmin@smart-s.com', password: await hash('password123'), firstname: 'ICT', lastname: 'Administrator', phone: '+1234567892', roles: ['ICT_administrator'], school: school._id, isActive: true },
    { email: 'principal@smart-s.com', password: await hash('password123'), firstname: 'School', lastname: 'Principal', phone: '+1234567893', roles: ['Principal'], school: school._id, isActive: true },
    { email: 'bursar@smart-s.com', password: await hash('password123'), firstname: 'School', lastname: 'Bursar', phone: '+1234567894', roles: ['Bursar'], school: school._id, isActive: true },
    { email: 'auditor@smart-s.com', password: await hash('password123'), firstname: 'System', lastname: 'Auditor', phone: '+1234567896', roles: ['Auditor'], school: school._id, isActive: true },
    { email: 'student@smart-s.com', password: await hash('password123'), firstname: 'Test', lastname: 'Student', phone: '+1234567895', roles: ['Student'], school: school._id, classArm: classArms[0]._id, isActive: true, regNo: 'STU001', gender: 'Female', type: 'day' },
    { email: 'parent@smart-s.com', password: await hash('password123'), firstname: 'Jane', lastname: 'Doe', phone: '+1234567897', roles: ['Parent'], school: school._id, isActive: true },
  ]

  const users = await User.insertMany(usersData)
  const studentUser = users.find(u => u.roles.includes('Student'))

  // Fees for term
  const fees = await Fee.insertMany([
    { term: term1._id, school: school._id, name: 'Tuition', decription: 'Tuition fee for term', type: 'tuition', isActive: true, isInstallmentAllowed: false, no_ofInstallments: 1, amount: 50000, isApproved: true },
    { term: term1._id, school: school._id, name: 'PTA', decription: 'PTA levy', type: 'levy', isActive: true, isInstallmentAllowed: false, no_ofInstallments: 1, amount: 5000, isApproved: true },
  ])

  // Payment profile (disabled by default)
  await PaymentProfile.create({
    school: school._id,
    activate_ps: false,
    activate_fw: false,
    ps_public_key: '',
    ps_secret_key: '',
    fw_public_key: '',
    fw_secret_key: '',
    account_no: '0000000000',
    account_name: 'Smart School Academy',
    bank_name: 'Demo Bank',
  })

  // Optional: sample payment record
  if (Payment) {
    await Payment.create({
      user: studentUser._id,
      fee: fees[0]._id,
      amount: 50000,
      mode_of_payment: 'cash',
      status: 'success',
      channel: 'web',
      paid_at: new Date(),
    })
  }

  return {
    groupSchoolId: groupSchool._id,
    schoolId: school._id,
    sessionId: session._id,
    termId: term1._id,
    classArmIds: classArms.map(c => c._id),
    userIds: users.map(u => u._id),
    feeIds: fees.map(f => f._id),
  }
}

// If invoked directly, run the seeding
if (require.main === module) {
  resetAndSeed()
    .then((result) => {
      console.log('\n✅ Database seeded successfully!')
      console.log('📊 Created:')
      console.log(`   - Group School: ${result.groupSchoolId}`)
      console.log(`   - School: ${result.schoolId}`)
      console.log(`   - Session: ${result.sessionId}`)
      console.log(`   - Term: ${result.termId}`)
      console.log(`   - Class Arms: ${result.classArmIds.length}`)
      console.log(`   - Users: ${result.userIds.length}`)
      console.log(`   - Fees: ${result.feeIds.length}`)
      console.log('\n🔐 Test User Credentials:')
      console.log('   Admin: admin@ledgrio.com / KGnd#%$ld')
      console.log('   ICT Admin: ictadmin@smart-s.com / password123')
      console.log('   Principal: principal@smart-s.com / password123')
      console.log('   Bursar: bursar@smart-s.com / password123')
      console.log('   Auditor: auditor@smart-s.com / password123')
      console.log('   Student: student@smart-s.com / password123')
      console.log('   Parent: parent@smart-s.com / password123')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error seeding database:', error.message)
      process.exit(1)
    })
}

module.exports = { resetAndSeed }


