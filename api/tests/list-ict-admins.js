const mongoose = require('mongoose')
require('dotenv').config()

const User = require('./model/User')

async function listICTAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Find all ICT Admin users
    const ictAdmins = await User.find({
      roles: 'ICT_administrator',
    }).populate('school')

    console.log(`Found ${ictAdmins.length} ICT Admin users:`)

    ictAdmins.forEach((admin, index) => {
      console.log(`\n${index + 1}. Email: ${admin.email}`)
      console.log(`   Name: ${admin.firstname} ${admin.lastname}`)
      console.log(`   Roles: ${admin.roles.join(', ')}`)
      console.log(
        `   School: ${admin.school ? admin.school.name : 'No school assigned'}`
      )
      console.log(`   Status: ${admin.status}`)
      console.log(`   Active: ${admin.isActive}`)
    })

    // Also check for users with ICT-related roles
    const allUsers = await User.find({
      $or: [
        { roles: { $in: ['ICT_administrator', 'ICT Admin', 'ict_admin'] } },
        { email: { $regex: /ict/i } },
      ],
    }).populate('school')

    if (allUsers.length > ictAdmins.length) {
      console.log(
        `\nFound ${
          allUsers.length - ictAdmins.length
        } additional ICT-related users:`
      )

      allUsers.forEach((user, index) => {
        if (!user.roles.includes('ICT_administrator')) {
          console.log(`\n${index + 1}. Email: ${user.email}`)
          console.log(`   Name: ${user.firstname} ${user.lastname}`)
          console.log(`   Roles: ${user.roles.join(', ')}`)
          console.log(
            `   School: ${
              user.school ? user.school.name : 'No school assigned'
            }`
          )
        }
      })
    }

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

listICTAdmins()
