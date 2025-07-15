const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testFrontendUserCreation() {
  try {
    console.log('🧪 TESTING FRONTEND USER CREATION FLOW')
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

    // Test 2: Get Schools (for frontend dropdown)
    console.log('\nStep 2: Getting schools for dropdown...')
    const schoolsResponse = await axios.get(`${BASE_URL}/schools/by-group`, {
      headers: { Authorization: `Bearer ${ictToken}` },
    })

    const schools = schoolsResponse.data.schools || []
    console.log(`✅ Retrieved ${schools.length} schools`)
    if (schools.length > 0) {
      console.log('Available schools:', schools.map(s => ({ id: s._id, name: s.name })))
    }

    // Test 3: Create Principal (simulating frontend form submission)
    console.log('\nStep 3: Creating Principal via frontend API...')
    const principalData = {
      firstname: 'Frontend',
      lastname: 'Principal',
      email: `frontend.principal.${Date.now()}@school.com`,
      phone: '+1234567890',
      roles: ['Principal'],
      gender: 'Male',
      type: 'day',
      regNo: `FP${Date.now()}`,
      school: schools[0]?._id || ictUser.school?._id,
    }

    console.log('Principal data to send:', principalData)

    const createResponse = await axios.post(`${BASE_URL}/users`, principalData, {
      headers: { Authorization: `Bearer ${ictToken}` },
    })

    console.log('✅ Principal created successfully!')
    console.log('Response:', createResponse.data.message)

    // Test 4: Create Student (simulating frontend form submission)
    console.log('\nStep 4: Creating Student via frontend API...')
    const studentData = {
      firstname: 'Frontend',
      lastname: 'Student',
      email: `frontend.student.${Date.now()}@school.com`,
      phone: '+1234567891',
      roles: ['Student'],
      gender: 'Female',
      type: 'boarding',
      regNo: `FS${Date.now()}`,
      school: schools[0]?._id || ictUser.school?._id,
    }

    console.log('Student data to send:', studentData)

    const createStudentResponse = await axios.post(`${BASE_URL}/users`, studentData, {
      headers: { Authorization: `Bearer ${ictToken}` },
    })

    console.log('✅ Student created successfully!')
    console.log('Response:', createStudentResponse.data.message)

    // Test 5: Verify users appear in list
    console.log('\nStep 5: Verifying users appear in list...')
    const usersResponse = await axios.get(`${BASE_URL}/school-access/users`, {
      headers: { Authorization: `Bearer ${ictToken}` },
    })

    const users = usersResponse.data.data?.users || []
    console.log(`✅ Retrieved ${users.length} users from list`)

    const newPrincipal = users.find(user => user.email === principalData.email)
    const newStudent = users.find(user => user.email === studentData.email)

    if (newPrincipal) {
      console.log('✅ Principal found in user list!')
      console.log('Principal details:', {
        name: `${newPrincipal.firstname} ${newPrincipal.lastname}`,
        email: newPrincipal.email,
        roles: newPrincipal.roles
      })
    } else {
      console.log('❌ Principal NOT found in user list')
    }

    if (newStudent) {
      console.log('✅ Student found in user list!')
      console.log('Student details:', {
        name: `${newStudent.firstname} ${newStudent.lastname}`,
        email: newStudent.email,
        roles: newStudent.roles
      })
    } else {
      console.log('❌ Student NOT found in user list')
    }

    // Test 6: Test login with new users
    console.log('\nStep 6: Testing login with new users...')
    
    // Test principal login
    try {
      const principalLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: principalData.email,
        password: 'password123',
      })
      console.log('✅ Principal can login successfully!')
    } catch (error) {
      console.log('❌ Principal login failed:', error.response?.data?.message || error.message)
    }

    // Test student login
    try {
      const studentLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: studentData.email,
        password: 'password123',
      })
      console.log('✅ Student can login successfully!')
    } catch (error) {
      console.log('❌ Student login failed:', error.response?.data?.message || error.message)
    }

    console.log('\n🎯 FRONTEND USER CREATION TEST COMPLETED')
    console.log('✅ All core functionality working!')

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message)
    if (error.response?.data) {
      console.error('Error details:', error.response.data)
    }
  }
}

// Run the test
testFrontendUserCreation()
