const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createICTAdmin() {
  try {
    console.log('Creating ICT Admin using correct route...\n')

    // Login as Admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })
    const adminToken = loginResponse.data.data.token
    console.log('✅ Admin logged in') // Get existing school
    const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const schools = Array.isArray(schoolsResponse.data)
      ? schoolsResponse.data
      : []
    if (schools.length === 0) {
      throw new Error('No schools found')
    }
    const schoolId = schools[0]._id
    console.log('✅ Using school:', schools[0].name)

    // Create ICT Admin using proper route
    const ictAdminData = {
      firstname: 'Sarah',
      lastname: 'Tech',
      email: 'ict2@system.edu',
      phone: '+1987654322',
      password: 'password123',
      type: 'day',
      gender: 'Female',
      regNo: 'ICT002',
      school: schoolId,
    }

    const ictAdminResponse = await axios.post(
      `${BASE_URL}/user/ict-admin/create`,
      ictAdminData,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    console.log('✅ ICT Admin created:', ictAdminResponse.data)

    // Test login
    const testLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ict2@system.edu',
      password: 'password123',
    })

    console.log('✅ Login successful!')
    console.log('User:', testLogin.data.data.user.email)

    console.log('\n🎉 Second ICT Admin created successfully!')
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message)
  }
}

createICTAdmin()
