const mongoose = require('mongoose')
require('dotenv').config()

async function testDBConnection() {
  console.log('🧪 Testing database connection...')

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Database connected successfully')

    // Test a simple query
    const User = require('./model/User')
    const userCount = await User.countDocuments()
    console.log(`✅ Found ${userCount} users in database`)

    // Look for ICT Admin
    const ictAdminCount = await User.countDocuments({
      roles: 'ICT_administrator',
    })
    console.log(`✅ Found ${ictAdminCount} ICT Administrators`)

    if (ictAdminCount > 0) {
      const ictAdmin = await User.findOne({ roles: 'ICT_administrator' })
      console.log('✅ Sample ICT Admin:', {
        email: ictAdmin.email,
        roles: ictAdmin.roles,
      })
    }
  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

testDBConnection()
