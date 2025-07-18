const mongoose = require('mongoose')
require('dotenv').config()

// Import models
const User = require('../model/User')
const School = require('../model/School')

async function checkExistingUsers() {
  try {
    console.log('🔍 CHECKING EXISTING USERS IN DATABASE')
    console.log('==================================================')

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Get all users
    const users = await User.find({})
      .populate('school')
      .select('firstname lastname email roles school isActive')

    console.log(`\n📊 Found ${users.length} users in database:`)
    console.log('==================================================')

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.firstname} ${user.lastname}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Roles: ${user.roles.join(', ')}`)
      console.log(`   School: ${user.school?.name || 'No school assigned'}`)
      console.log(`   Active: ${user.isActive}`)
    })

    // Check for specific roles
    console.log('\n🎯 USERS BY ROLE:')
    console.log('==================================================')

    const roleGroups = {
      Admin: users.filter((u) => u.roles.includes('Admin')),
      ICT_administrator: users.filter((u) =>
        u.roles.includes('ICT_administrator')
      ),
      Bursar: users.filter((u) => u.roles.includes('Bursar')),
      Principal: users.filter((u) => u.roles.includes('Principal')),
      Student: users.filter((u) => u.roles.includes('Student')),
      Parent: users.filter((u) => u.roles.includes('Parent')),
    }

    Object.entries(roleGroups).forEach(([role, roleUsers]) => {
      console.log(`\n${role}: ${roleUsers.length} users`)
      roleUsers.forEach((user) => {
        console.log(`  - ${user.firstname} ${user.lastname} (${user.email})`)
      })
    })

    // Close connection
    await mongoose.connection.close()
    console.log('\n✅ Database connection closed')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkExistingUsers()
