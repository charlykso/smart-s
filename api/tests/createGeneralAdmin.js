const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./model/User')
require('dotenv').config()

const createGeneralAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Check if General Admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@ledgrio.com' })
    if (existingAdmin) {
      console.log('⚠️  General Admin already exists:', existingAdmin.email)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create General Admin user
    const generalAdmin = new User({
      firstname: 'System',
      lastname: 'Administrator',
      email: 'admin@ledgrio.com',
      phone: '+1234567800',
      password: hashedPassword,
      roles: ['Admin'],
      type: 'day',
      gender: 'Male',
      regNo: 'ADM001',
      status: 'active',
      isActive: true,
      // Note: General Admin doesn't belong to any specific school
    })

    await generalAdmin.save()
    console.log('✅ General Admin created successfully!')
    console.log('📧 Email: admin@ledgrio.com')
    console.log('🔐 Password: password123')
    console.log(
      '👑 Role: Admin (can create Group Schools and ICT Administrators)'
    )
  } catch (error) {
    console.error('Error creating General Admin:', error)
  } finally {
    mongoose.disconnect()
  }
}

createGeneralAdmin()
