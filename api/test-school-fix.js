const mongoose = require('mongoose')
require('dotenv').config()

// Import models
const User = require('./model/User')
const School = require('./model/School')
const GroupSchool = require('./model/GroupSchool')
const Address = require('./model/Address')

async function testSchoolFix() {
  try {
    console.log('🔧 Testing School Fix...\n')

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/smart-s'
    )
    console.log('✅ Connected to MongoDB')

    // Find ICT Admin user
    const ictAdmin = await User.findOne({
      email: 'ictadmin@smart-s.com',
    }).populate('school')

    if (!ictAdmin) {
      console.log('❌ ICT Admin not found')
      return
    }

    console.log('✅ ICT Admin found:')
    console.log('   Name:', ictAdmin.firstname, ictAdmin.lastname)
    console.log('   School ID:', ictAdmin.school?._id)
    console.log('   School Name:', ictAdmin.school?.name)

    // Test the school filter logic
    const userSchool = ictAdmin.school?._id || ictAdmin.school
    const isGeneralAdmin = ictAdmin.roles.includes('Admin') && !userSchool

    console.log('\n🔍 Filter Logic Test:')
    console.log('   User School:', userSchool)
    console.log('   Is General Admin:', isGeneralAdmin)

    let filter = {}
    if (!isGeneralAdmin) {
      if (!userSchool) {
        console.log('❌ No school assigned')
        return
      }
      filter = { _id: userSchool }
    }

    console.log('   Filter:', filter)

    // Test the query
    const schools = await School.find(filter)
      .populate('address', 'country state zip_code town street street_no')
      .populate('groupSchool', 'name logo')

    console.log('\n✅ Schools found:', schools.length)
    schools.forEach((school, index) => {
      console.log(`   ${index + 1}. ${school.name} (ID: ${school._id})`)
    })

    // Test Bursar too
    const bursar = await User.findOne({
      email: 'bursar@smart-s.com',
    }).populate('school')

    if (bursar) {
      console.log('\n✅ Bursar found:')
      console.log('   Name:', bursar.firstname, bursar.lastname)
      console.log('   School ID:', bursar.school?._id)
      console.log('   School Name:', bursar.school?.name)

      const bursarSchool = bursar.school?._id || bursar.school
      const bursarFilter = bursarSchool ? { _id: bursarSchool } : {}

      const bursarSchools = await School.find(bursarFilter)
      console.log('   Bursar Schools found:', bursarSchools.length)
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

testSchoolFix()
