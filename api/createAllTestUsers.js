const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./model/User')
require('dotenv').config()

const createAllTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Test users to create
    const testUsers = [
      {
        firstname: 'Admin',
        lastname: 'User',
        email: 'admin@ledgrio.com',
        phone: '+1234567890',
        password: hashedPassword,
        roles: ['Admin'],
        type: 'day',
        gender: 'Male',
        regNo: 'ADM001',
      },
      {
        firstname: 'John',
        lastname: 'Student',
        email: 'student@ledgrio.com',
        phone: '+1234567891',
        password: hashedPassword,
        roles: ['Student'],
        type: 'day',
        gender: 'Male',
        regNo: 'STU001',
      },
      {
        firstname: 'Dr. Sarah',
        lastname: 'Principal',
        email: 'principal@ledgrio.com',
        phone: '+1234567892',
        password: hashedPassword,
        roles: ['Principal'],
        type: 'day',
        gender: 'Female',
        regNo: 'PRI001',
      },
      {
        firstname: 'Michael',
        lastname: 'Bursar',
        email: 'bursar@ledgrio.com',
        phone: '+1234567893',
        password: hashedPassword,
        roles: ['Bursar'],
        type: 'day',
        gender: 'Male',
        regNo: 'BUR001',
      },
      {
        firstname: 'Mary',
        lastname: 'Parent',
        email: 'parent@ledgrio.com',
        phone: '+1234567894',
        password: hashedPassword,
        roles: ['Parent'],
        type: 'day',
        gender: 'Female',
        regNo: 'PAR001',
      },
      {
        firstname: 'James',
        lastname: 'Auditor',
        email: 'auditor@ledgrio.com',
        phone: '+1234567895',
        password: hashedPassword,
        roles: ['Auditor'],
        type: 'day',
        gender: 'Male',
        regNo: 'AUD001',
      },
      {
        firstname: 'David',
        lastname: 'ICTAdmin',
        email: 'ictadmin@ledgrio.com',
        phone: '+1234567896',
        password: hashedPassword,
        roles: ['ICT_administrator'],
        type: 'day',
        gender: 'Male',
        regNo: 'ICT001',
      },
      {
        firstname: 'Robert',
        lastname: 'Proprietor',
        email: 'proprietor@ledgrio.com',
        phone: '+1234567897',
        password: hashedPassword,
        roles: ['Proprietor'],
        type: 'day',
        gender: 'Male',
        regNo: 'PRO001',
      },
      {
        firstname: 'Mrs. Jane',
        lastname: 'Headteacher',
        email: 'headteacher@ledgrio.com',
        phone: '+1234567898',
        password: hashedPassword,
        roles: ['Headteacher'],
        type: 'day',
        gender: 'Female',
        regNo: 'HEAD001',
      },
    ]

    console.log('Creating test users...\n')

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email })

      if (existingUser) {
        console.log(
          `✓ ${userData.roles[0]} user already exists: ${userData.email}`
        )
      } else {
        const user = new User(userData)
        await user.save()
        console.log(`✓ ${userData.roles[0]} user created: ${userData.email}`)
      }
    }

    console.log('\n=== TEST USER CREDENTIALS ===')
    console.log('All users have password: password123\n')

    testUsers.forEach((user) => {
      console.log(`${user.roles[0].toUpperCase()}:`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Name: ${user.firstname} ${user.lastname}`)
      console.log(`  RegNo: ${user.regNo}\n`)
    })

    console.log('=== TESTING INSTRUCTIONS ===')
    console.log('1. Login with any of the above credentials')
    console.log('2. Password for all users: password123')
    console.log('3. Each user will see their role-specific dashboard')
    console.log('4. Backend endpoints are now available for all roles\n')

    // Test password verification for one user
    const testUser = await User.findOne({ email: 'admin@ledgrio.com' })
    if (testUser) {
      const isPasswordValid = await bcrypt.compare(
        'password123',
        testUser.password
      )
      console.log(
        'Password verification test:',
        isPasswordValid ? 'PASSED ✓' : 'FAILED ✗'
      )
    }

    process.exit(0)
  } catch (error) {
    console.error('Error creating test users:', error)
    process.exit(1)
  }
}

createAllTestUsers()
