const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createSecondICTAdminSimple() {
  try {
    console.log('Creating Second ICT Admin - Simple Approach...\n')

    // Step 1: Login as Admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })
    const adminToken = loginResponse.data.data.token
    console.log('✅ Admin logged in')

    // Step 2: Get any existing school to associate with
    const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    
    const schools = schoolsResponse.data.schools || schoolsResponse.data || []
    if (schools.length === 0) {
      throw new Error('No schools available')
    }
    
    // Use the first available school
    const schoolId = schools[0]._id
    console.log('✅ Using school:', schools[0].name)

    // Step 3: Create Second ICT Admin user
    const ictAdminData = {
      firstname: 'Sarah',
      lastname: 'Tech',
      email: 'ict2@system.edu',
      phone: '+1987654322',
      password: 'password123',
      roles: ['ICT_administrator'],
      type: 'day',
      gender: 'Female',
      regNo: 'ICT002',
      school: schoolId,
    }    try {
      const ictAdminResponse = await axios.post(`${BASE_URL}/user/ict-admin/create`, ictAdminData, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      })
      console.log('✅ Second ICT Admin created:', ictAdminResponse.data.user.email)
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Second ICT Admin already exists')
      } else {
        console.log('Creation error:', error.response?.data)
        throw error
      }
    }

    // Step 4: Test login
    const testLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ict2@system.edu',
      password: 'password123',
    })

    console.log('✅ Second ICT Admin login successful!')
    const user = testLogin.data.data.user
    const token = testLogin.data.data.token

    console.log('User Details:')
    console.log(`- Name: ${user.firstname} ${user.lastname}`)
    console.log(`- Email: ${user.email}`)
    console.log(`- Roles: ${user.roles.join(', ')}`)

    // Step 5: Test ICT Admin endpoints
    console.log('\nTesting ICT Admin endpoints...')

    try {
      const managedSchoolsResponse = await axios.get(`${BASE_URL}/users/managed-schools`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log('✅ Managed Schools endpoint works')
      console.log('Schools:', managedSchoolsResponse.data.schools.map(s => s.name))
    } catch (error) {
      console.log('❌ Managed schools error:', error.response?.data?.message)
    }

    try {
      const schoolsByGroupResponse = await axios.get(`${BASE_URL}/schools/by-group`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log('✅ Schools by group endpoint works')
      console.log('Schools:', schoolsByGroupResponse.data.schools.map(s => s.name))
    } catch (error) {
      console.log('❌ Schools by group error:', error.response?.data?.message)
    }

    try {
      await axios.get(`${BASE_URL}/bulk-students/template`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log('✅ Template download works')
    } catch (error) {
      console.log('❌ Template download error:', error.response?.data?.message)
    }

    console.log('\n🎉 Second ICT Admin setup completed!')
    console.log('\n📋 ICT Admins Summary:')
    console.log('1. First ICT Admin: ict@greenwood.edu / password123')
    console.log('2. Second ICT Admin: ict2@system.edu / password123')

  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message)
  }
}

createSecondICTAdminSimple()
