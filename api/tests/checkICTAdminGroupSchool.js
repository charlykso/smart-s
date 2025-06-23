const connectDB = require('./db/connection')
const User = require('./model/User')
const School = require('./model/School')
const GroupSchool = require('./model/GroupSchool')
require('dotenv').config()

async function checkICTAdminGroupSchool() {
  try {
    await connectDB()
    console.log('Connected to MongoDB using existing connection')

    // Find the ICT Admin user and populate school and group school details
    const ictAdmin = await User.findOne({
      email: 'ictadmin@smartschool.edu',
    }).populate({
      path: 'school',
      populate: {
        path: 'groupSchool',
        model: 'GroupSchool',
      },
    })

    if (ictAdmin) {
      console.log('═══════════════════════════════════════')
      console.log('📋 ICT ADMIN USER DETAILS')
      console.log('═══════════════════════════════════════')
      console.log('👤 Name:', ictAdmin.firstname, ictAdmin.lastname)
      console.log('📧 Email:', ictAdmin.email)
      console.log('🎭 Role:', ictAdmin.roles)
      console.log('🆔 User ID:', ictAdmin._id)
      console.log('')

      if (ictAdmin.school) {
        console.log('🏫 SCHOOL DETAILS:')
        console.log('───────────────────────────────────────')
        console.log('🏫 School Name:', ictAdmin.school.name)
        console.log('📧 School Email:', ictAdmin.school.email)
        console.log('📞 School Phone:', ictAdmin.school.phoneNumber)
        console.log('🆔 School ID:', ictAdmin.school._id)
        console.log('✅ School Active:', ictAdmin.school.isActive)
        console.log('')

        if (ictAdmin.school.groupSchool) {
          console.log('🏢 GROUP SCHOOL DETAILS:')
          console.log('───────────────────────────────────────')
          console.log('🏢 Group School Name:', ictAdmin.school.groupSchool.name)
          console.log('🆔 Group School ID:', ictAdmin.school.groupSchool._id)
          console.log(
            '📝 Description:',
            ictAdmin.school.groupSchool.description
          )
          console.log('🖼️  Logo:', ictAdmin.school.groupSchool.logo)
          console.log('')
          console.log(
            '✅ RESULT: ICT Admin belongs to "' +
              ictAdmin.school.groupSchool.name +
              '"'
          )
        } else {
          console.log('⚠️  No Group School found for this school')
        }
      } else {
        console.log('⚠️  No School found for this ICT Admin')
      }
    } else {
      console.log('❌ ICT Admin user not found')
    }
    console.log('✅ Database connection closed')
  } catch (error) {
    console.error('Error:', error)
  }
}

checkICTAdminGroupSchool()
