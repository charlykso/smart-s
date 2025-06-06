const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./model/User')
require('dotenv').config()

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'admin@smart-s.com' })
    if (existingUser) {
      console.log('Test user already exists')
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create test user
    const testUser = new User({
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@smart-s.com',
      phone: '+1234567890',
      password: hashedPassword,
      roles: ['Admin'],
      type: 'day',
      gender: 'Male',
      regNo: 'ADM001',
    })

    await testUser.save()
    console.log('Test admin user created successfully:')
    console.log('Email: admin@smart-s.com')
    console.log('Password: password123')
    console.log('Roles: Admin')

    // Create test student user
    const existingStudent = await User.findOne({ email: 'student@smart-s.com' })
    if (!existingStudent) {
      const studentUser = new User({
        firstname: 'John',
        lastname: 'Student',
        email: 'student@smart-s.com',
        phone: '+1234567891',
        password: hashedPassword,
        roles: ['Student'],
        type: 'day',
        gender: 'Male',
        regNo: 'STU001',
      })

      await studentUser.save()
      console.log('Test student user created successfully:')
      console.log('Email: student@smart-s.com')
      console.log('Password: password123')
      console.log('Roles: Student')
    }

    process.exit(0)
  } catch (error) {
    console.error('Error creating test user:', error)
    process.exit(1)
  }
}

createTestUser()
