const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('./model/User')
const School = require('./model/School')

async function createICTAdminDirect() {
  try {
    console.log('Creating ICT Admin directly in database...\n')

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to database')

    // Find existing school
    const school = await School.findOne()
    if (!school) {
      throw new Error('No school found in database')
    }
    console.log('✅ Found school:', school.name)

    // Check if ICT admin already exists
    const existingICTAdmin = await User.findOne({
      email: 'ict@greenwood.edu',
      roles: 'ICT_administrator',
    })

    if (existingICTAdmin) {
      console.log('ℹ️ ICT Admin already exists:', existingICTAdmin.email)
      console.log('User details:', {
        id: existingICTAdmin._id,
        email: existingICTAdmin.email,
        roles: existingICTAdmin.roles,
        school: existingICTAdmin.school,
      })
    } else {
      // Create new ICT Admin
      const hashedPassword = await bcrypt.hash('password123', 10)

      const ictAdmin = new User({
        firstname: 'ICT',
        lastname: 'Administrator',
        email: 'ict@greenwood.edu',
        password: hashedPassword,
        roles: ['ICT_administrator'],
        school: school._id,
        status: 'active',
        isActive: true,
        type: 'day',
        gender: 'Male',
        phone: '+1234567890',
      })

      await ictAdmin.save()
      console.log('✅ ICT Admin created successfully:', ictAdmin.email)
      console.log('User details:', {
        id: ictAdmin._id,
        email: ictAdmin.email,
        roles: ictAdmin.roles,
        school: ictAdmin.school,
      })
    }

    console.log('\n🎉 ICT Admin setup completed!')
    console.log('\n📝 Credentials:')
    console.log('Email: ict@greenwood.edu')
    console.log('Password: password123')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

createICTAdminDirect()
