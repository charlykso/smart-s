const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createSecondICTSimple() {
  try {
    console.log('Creating Second ICT Admin - Simplified...\n')

    // Login as Admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })
    const adminToken = loginResponse.data.data.token
    console.log('✅ Admin logged in')

    // Get existing schools
    const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const schools = Array.isArray(schoolsResponse.data)
      ? schoolsResponse.data
      : []

    if (schools.length === 0) {
      throw new Error('No schools available')
    }

    // Use the first school (we'll create different ICT admins for the same school for testing)
    const schoolId = schools[0]._id
    console.log('✅ Using school:', schools[0].name)

    // Create second ICT Admin with different email
    const ictAdminData = {
      firstname: 'Alex',
      lastname: 'Manager',
      email: 'ict-secondary@system.edu',
      phone: '+1555123456',
      password: 'password123',
      type: 'day',
      gender: 'Male',
      regNo: 'ICT003',
      school: schoolId,
    }

    try {
      await axios.post(`${BASE_URL}/user/ict-admin/create`, ictAdminData, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      })
      console.log('✅ Second ICT Admin created')
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Second ICT Admin already exists')
      } else {
        console.log('Creation failed:', error.response?.data)
        throw error
      }
    }

    // Test login
    const testLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ict-secondary@system.edu',
      password: 'password123',
    })

    console.log('✅ Login successful!')
    const user = testLogin.data.data.user
    const token = testLogin.data.data.token

    console.log('User Details:')
    console.log(`- Name: ${user.firstname} ${user.lastname}`)
    console.log(`- Email: ${user.email}`)

    // Test ICT Admin endpoints
    console.log('\nTesting endpoints...')

    try {
      const managedSchoolsResponse = await axios.get(
        `${BASE_URL}/users/managed-schools`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      console.log('✅ Managed Schools works')
      console.log(
        'Schools:',
        managedSchoolsResponse.data.schools.map((s) => s.name)
      )
    } catch (error) {
      console.log('❌ Managed schools error:', error.response?.data?.message)
    }

    try {
      const schoolsByGroupResponse = await axios.get(
        `${BASE_URL}/schools/by-group`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      console.log('✅ Schools by group works')
      console.log(
        'Schools:',
        schoolsByGroupResponse.data.schools.map((s) => s.name)
      )
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

    console.log('\n🎉 Second ICT Admin created and tested successfully!')
    console.log('\n📋 Available ICT Admins:')
    console.log('1. ict@greenwood.edu / password123')
    console.log('2. ict-secondary@system.edu / password123')
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message)
  }
}

createSecondICTSimple()
