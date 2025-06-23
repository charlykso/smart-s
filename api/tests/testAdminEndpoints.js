const axios = require('axios')
const jwt = require('jsonwebtoken')

async function testAdminEndpoints() {
  try {
    console.log('🔐 Logging in as admin...')

    // Login to get token
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'admin@ledgrio.com',
        password: 'password123',
      }
    )

    const token = loginResponse.data.data.token
    console.log('✅ Login successful, token received')

    // Debug: Decode token to see its structure
    try {
      const decoded = jwt.decode(token)
      console.log('🔍 Token payload:', JSON.stringify(decoded, null, 2))
    } catch (e) {
      console.log('❌ Failed to decode token:', e.message)
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }

    console.log('\n📋 Testing admin endpoints...')

    // Test 1: Get all schools
    try {
      console.log('\n1. Testing GET /api/v1/admin/schools')
      const schoolsResponse = await axios.get(
        'http://localhost:3000/api/v1/admin/schools',
        config
      )
      console.log(
        '✅ Schools endpoint response:',
        JSON.stringify(schoolsResponse.data, null, 2)
      )
    } catch (error) {
      console.log(
        '❌ Schools endpoint error:',
        error.response?.data || error.message
      )
    }
    // Test 2: Get all ICT administrators
    try {
      console.log('\n2. Testing GET /api/v1/admin/ict-administrators')
      const ictAdminsResponse = await axios.get(
        'http://localhost:3000/api/v1/admin/ict-administrators',
        config
      )
      console.log(
        '✅ ICT Administrators endpoint response:',
        JSON.stringify(ictAdminsResponse.data, null, 2)
      )
    } catch (error) {
      console.log(
        '❌ ICT Administrators endpoint error:',
        error.response?.data || error.message
      )
    }

    // Test 3: Test existing admin dashboard
    try {
      console.log('\n3. Testing GET /api/v1/admin/dashboard')
      const dashboardResponse = await axios.get(
        'http://localhost:3000/api/v1/admin/dashboard',
        config
      )
      console.log(
        '✅ Dashboard endpoint working - got',
        Object.keys(dashboardResponse.data).length,
        'properties'
      )
    } catch (error) {
      console.log(
        '❌ Dashboard endpoint error:',
        error.response?.data || error.message
      )
    }

    console.log('\n🎉 Admin endpoints testing completed!')
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message)
  }
}

testAdminEndpoints()
