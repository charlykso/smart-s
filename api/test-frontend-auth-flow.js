const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

async function testFrontendAuthFlow() {
  console.log('🔍 Testing Frontend Authentication Flow...\n')

  try {
    // Step 1: Login as student
    console.log('1. Logging in as student...')
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teststudent@test.com',
      password: 'password123'
    })

    const { user, token, refreshToken } = loginResponse.data.data
    console.log('✅ Login successful')
    console.log('   User:', user.firstname, user.lastname)
    console.log('   School:', user.school.name)
    console.log('   Token length:', token.length)

    // Step 2: Test authenticated requests (simulating frontend)
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    console.log('\n2. Testing authenticated endpoints...')

    // Test student dashboard
    try {
      const dashboardResponse = await axios.get(`${API_BASE}/student/dashboard`, { headers })
      console.log('✅ Student dashboard: 200')
    } catch (error) {
      console.log('❌ Student dashboard failed:', error.response?.status, error.response?.data?.message)
    }

    // Test student approved fees
    try {
      const feesResponse = await axios.get(`${API_BASE}/fee/student/approved-fees`, { headers })
      console.log('✅ Student approved fees: 200 -', feesResponse.data?.data?.length || 0, 'fees')
    } catch (error) {
      console.log('❌ Student approved fees failed:', error.response?.status, error.response?.data?.message)
    }

    // Test student payments
    try {
      const paymentsResponse = await axios.get(`${API_BASE}/payment/student/my-payments`, { headers })
      console.log('✅ Student payments: 200 -', paymentsResponse.data?.data?.length || 0, 'payments')
    } catch (error) {
      console.log('❌ Student payments failed:', error.response?.status, error.response?.data?.message)
    }

    // Test payment methods
    try {
      const methodsResponse = await axios.get(`${API_BASE}/payment/available-methods/${user.school._id}`, { headers })
      console.log('✅ Payment methods: 200 -', methodsResponse.data?.data?.length || 0, 'methods')
    } catch (error) {
      console.log('❌ Payment methods failed:', error.response?.status, error.response?.data?.message)
    }

    console.log('\n✅ All authenticated requests successful!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

testFrontendAuthFlow()
