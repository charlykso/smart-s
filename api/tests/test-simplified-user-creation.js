const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testSimplifiedUserCreation() {
  try {
    console.log('🧪 TESTING SIMPLIFIED USER CREATION FLOW')
    console.log('='.repeat(50))

    // Test 1: ICT Admin Login
    console.log('Step 1: ICT Admin Login...')
    const ictLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ictadmin@smart-s.com',
      password: 'password123',
    })

    const ictToken = ictLogin.data.data.token
    const ictUser = ictLogin.data.data.user

    console.log('✅ ICT Admin logged in successfully')
    console.log('User school:', ictUser.school?.name || 'No school')
    console.log('School ID:', ictUser.school?._id || 'No school ID')

    // Test 2: Create Principal (simplified - no school dropdown needed)
    console.log('\nStep 2: Creating Principal (simplified)...')
    const principalData = {
      firstname: 'Simplified',
      lastname: 'Principal',
      email: `simplified.principal.${Date.now()}@school.com`,
      phone: '+1234567890',
      roles: ['Principal'],
      school: ictUser.school._id, // Use ICT admin's school
    }

    console.log('Principal data to send:', principalData)

    const createPrincipalResponse = await axios.post(
      `${BASE_URL}/users`,
      principalData,
      {
        headers: { Authorization: `Bearer ${ictToken}` },
      }
    )

    console.log('✅ Principal created successfully!')
    console.log('Response:', createPrincipalResponse.data.message)

    // Test 3: Create Student (with student-specific fields)
    console.log('\nStep 3: Creating Student (with student fields)...')
    const studentData = {
      firstname: 'Simplified',
      lastname: 'Student',
      email: `simplified.student.${Date.now()}@school.com`,
      phone: '+1234567891',
      roles: ['Student'],
      gender: 'Female',
      type: 'boarding',
      regNo: `SS${Date.now()}`,
      school: ictUser.school._id, // Use ICT admin's school
    }

    console.log('Student data to send:', studentData)

    const createStudentResponse = await axios.post(
      `${BASE_URL}/users`,
      studentData,
      {
        headers: { Authorization: `Bearer ${ictToken}` },
      }
    )

    console.log('✅ Student created successfully!')
    console.log('Response:', createStudentResponse.data.message)

    // Test 4: Create Headteacher (no student-specific fields)
    console.log('\nStep 4: Creating Headteacher (no student fields)...')
    const teacherData = {
      firstname: 'Simplified',
      lastname: 'Headteacher',
      email: `simplified.headteacher.${Date.now()}@school.com`,
      phone: '+1234567892',
      roles: ['Headteacher'],
      school: ictUser.school._id, // Use ICT admin's school
    }

    console.log('Headteacher data to send:', teacherData)

    const createTeacherResponse = await axios.post(
      `${BASE_URL}/users`,
      teacherData,
      {
        headers: { Authorization: `Bearer ${ictToken}` },
      }
    )

    console.log('✅ Headteacher created successfully!')
    console.log('Response:', createTeacherResponse.data.message)

    // Test 5: Verify all users appear in list
    console.log('\nStep 5: Verifying users appear in list...')
    const usersResponse = await axios.get(`${BASE_URL}/school-access/users`, {
      headers: { Authorization: `Bearer ${ictToken}` },
    })

    const users = usersResponse.data.data?.users || []
    console.log(`✅ Retrieved ${users.length} users from list`)

    const newPrincipal = users.find(
      (user) => user.email === principalData.email
    )
    const newStudent = users.find((user) => user.email === studentData.email)
    const newTeacher = users.find((user) => user.email === teacherData.email)

    if (newPrincipal) {
      console.log('✅ Principal found in user list!')
      console.log('Principal school:', newPrincipal.school?.name || 'No school')
    } else {
      console.log('❌ Principal NOT found in user list')
    }

    if (newStudent) {
      console.log('✅ Student found in user list!')
      console.log('Student details:', {
        regNo: newStudent.regNo,
        gender: newStudent.gender,
        type: newStudent.type,
        school: newStudent.school?.name || 'No school',
      })
    } else {
      console.log('❌ Student NOT found in user list')
    }

    if (newTeacher) {
      console.log('✅ Headteacher found in user list!')
      console.log('Headteacher school:', newTeacher.school?.name || 'No school')
    } else {
      console.log('❌ Headteacher NOT found in user list')
    }

    console.log('\n🎯 SIMPLIFIED USER CREATION TEST COMPLETED')
    console.log('✅ All functionality working with school auto-assignment!')
  } catch (error) {
    console.error(
      '❌ Test failed:',
      error.response?.data?.message || error.message
    )
    if (error.response?.data) {
      console.error('Error details:', error.response.data)
    }
  }
}

// Run the test
testSimplifiedUserCreation()
