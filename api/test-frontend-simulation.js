const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

// Simulate the exact frontend API calls
async function simulateFrontendFlow() {
  console.log('🔍 Simulating Frontend API Flow...\n')

  try {
    // Step 1: Login (simulating AuthService.login)
    console.log('1. Simulating AuthService.login...')
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teststudent@test.com',
      password: 'password123'
    })

    // This is what ApiService.post returns (response.data)
    const apiServiceResponse = loginResponse.data
    console.log('✅ ApiService.post returned:', {
      success: apiServiceResponse.success,
      hasData: !!apiServiceResponse.data,
      dataKeys: Object.keys(apiServiceResponse.data || {})
    })

    // This is what AuthService.login should return (response.data)
    const authResponse = apiServiceResponse.data
    console.log('✅ AuthService.login returns:', {
      hasUser: !!authResponse.user,
      hasToken: !!authResponse.token,
      hasRefreshToken: !!authResponse.refreshToken,
      userSchoolId: authResponse.user?.school?._id
    })

    // Step 2: Simulate frontend making authenticated requests
    const token = authResponse.token
    const user = authResponse.user
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    console.log('\n2. Simulating frontend authenticated requests...')
    console.log('   User school ID:', user.school?._id)

    // Test the exact endpoints the frontend calls
    const endpoints = [
      { name: 'Student Dashboard', url: `${API_BASE}/student/dashboard` },
      { name: 'Student Approved Fees', url: `${API_BASE}/fee/student/approved-fees` },
      { name: 'Student Payments', url: `${API_BASE}/payment/student/my-payments` },
      { name: 'Payment Methods', url: `${API_BASE}/payment/available-methods/${user.school._id}` }
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint.url, { headers })
        console.log(`✅ ${endpoint.name}: ${response.status}`)
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.response?.status} - ${error.response?.data?.message || error.message}`)
        console.log(`   URL: ${endpoint.url}`)
      }
    }

    console.log('\n✅ Frontend simulation completed!')

  } catch (error) {
    console.error('❌ Simulation failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

simulateFrontendFlow()
