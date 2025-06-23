const mongoose = require('mongoose')
require('dotenv').config()

const GroupSchool = require('./model/GroupSchool')
const School = require('./model/School')

async function checkGroupSchools() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Find all group schools
    const groupSchools = await GroupSchool.find()
    console.log(`Found ${groupSchools.length} Group Schools:`)

    groupSchools.forEach((gs, index) => {
      console.log(`\n${index + 1}. Name: ${gs.name}`)
      console.log(`   ID: ${gs._id}`)
      console.log(`   Description: ${gs.description || 'No description'}`)
      console.log(`   Logo: ${gs.logo || 'No logo'}`)
    })

    // Find all schools
    const schools = await School.find().populate('groupSchool')
    console.log(`\nFound ${schools.length} Schools:`)

    schools.forEach((school, index) => {
      console.log(`\n${index + 1}. Name: ${school.name}`)
      console.log(`   ID: ${school._id}`)
      console.log(
        `   Group School: ${
          school.groupSchool ? school.groupSchool.name : 'No group school'
        }`
      )
      console.log(`   Email: ${school.email || 'No email'}`)
    })

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkGroupSchools()
