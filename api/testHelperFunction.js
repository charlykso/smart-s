require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./model/User')
const School = require('./model/School')
const GroupSchool = require('./model/GroupSchool')

// Test the helper function (updated version without populate)
const checkExistingProprietorInGroupSchool = async (
  schoolId,
  excludeUserId = null
) => {
  // Get the school without populate to avoid hanging
  const school = await School.findById(schoolId)
  if (!school) {
    throw new Error('School not found')
  }

  if (!school.groupSchool) {
    throw new Error('School is not associated with a GroupSchool')
  }

  // Get the GroupSchool separately
  const groupSchoolId = school.groupSchool
  const groupSchool = await GroupSchool.findById(groupSchoolId)
  if (!groupSchool) {
    throw new Error('GroupSchool not found')
  }

  // Find all schools in the same GroupSchool
  const schoolsInGroup = await School.find({ groupSchool: groupSchoolId })
  const schoolIdsInGroup = schoolsInGroup.map((s) => s._id)

  const query = {
    school: { $in: schoolIdsInGroup },
    roles: 'Proprietor',
  }

  if (excludeUserId) {
    query._id = { $ne: excludeUserId }
  }

  const existingProprietor = await User.findOne(query)

  return {
    exists: !!existingProprietor,
    proprietor: existingProprietor,
    groupSchool: groupSchool,
    school: school,
  }
}

async function testHelper() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    const result = await checkExistingProprietorInGroupSchool(
      '68405b7d80498c76b2126e71'
    )
    console.log('Helper function result:', {
      exists: result.exists,
      proprietorName: result.proprietor
        ? `${result.proprietor.firstname} ${result.proprietor.lastname}`
        : 'None',
      groupSchoolName: result.groupSchool.name,
      schoolName: result.school.name,
    })

    if (result.exists) {
      console.log('✅ Constraint should BLOCK creating another proprietor')
    } else {
      console.log('❌ Constraint would ALLOW creating another proprietor')
    }
  } catch (error) {
    console.error('Helper function error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

testHelper()
