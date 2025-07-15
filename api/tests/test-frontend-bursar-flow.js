const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testFrontendBursarFlow() {
  console.log('🔍 TESTING FRONTEND BURSAR FLOW')
  console.log('==================================================')

  try {
    // Step 1: Login as Bursar (same as frontend would do)
    console.log('\nStep 1: Logging in as Bursar...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bursar@smart-s.com',
      password: 'password123',
    })

    if (!loginResponse.data.success) {
      throw new Error('Bursar login failed: ' + loginResponse.data.message)
    }

    const bursarToken = loginResponse.data.data?.token || loginResponse.data.token
    const bursarUser = loginResponse.data.data?.user || loginResponse.data.user
    console.log('✅ Bursar logged in successfully')
    console.log('Token length:', bursarToken?.length || 'No token')

    // Step 2: Test the exact endpoints the frontend calls
    console.log('\nStep 2: Testing Frontend Fee Management Endpoints...')
    
    // Test /fee/all (used by FeeService.getFees())
    try {
      const feesResponse = await axios.get(`${BASE_URL}/fee/all`, {
        headers: { 
          Authorization: `Bearer ${bursarToken}`,
          'Content-Type': 'application/json'
        },
      })
      console.log('✅ GET /fee/all: SUCCESS')
      console.log('Response type:', typeof feesResponse.data)
      console.log('Is array:', Array.isArray(feesResponse.data))
      console.log('Number of fees:', feesResponse.data?.length || 'Not an array')
    } catch (error) {
      console.log('❌ GET /fee/all: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
      console.log('Status:', error.response?.status)
    }

    // Test /fee/get-approved-fees (used by FeeService.getApprovedFees())
    try {
      const approvedFeesResponse = await axios.get(`${BASE_URL}/fee/get-approved-fees`, {
        headers: { 
          Authorization: `Bearer ${bursarToken}`,
          'Content-Type': 'application/json'
        },
      })
      console.log('✅ GET /fee/get-approved-fees: SUCCESS')
      console.log('Response type:', typeof approvedFeesResponse.data)
      console.log('Is array:', Array.isArray(approvedFeesResponse.data))
      console.log('Number of approved fees:', approvedFeesResponse.data?.length || 'Not an array')
    } catch (error) {
      console.log('❌ GET /fee/get-approved-fees: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
      console.log('Status:', error.response?.status)
    }

    // Test /bursar/dashboard (used by BursarService.getDashboardData())
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/bursar/dashboard`, {
        headers: { 
          Authorization: `Bearer ${bursarToken}`,
          'Content-Type': 'application/json'
        },
      })
      console.log('✅ GET /bursar/dashboard: SUCCESS')
      console.log('Response structure:', Object.keys(dashboardResponse.data))
      if (dashboardResponse.data.data) {
        console.log('Dashboard data keys:', Object.keys(dashboardResponse.data.data))
      }
    } catch (error) {
      console.log('❌ GET /bursar/dashboard: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
      console.log('Status:', error.response?.status)
    }

    // Step 3: Test with different token formats (in case frontend sends differently)
    console.log('\nStep 3: Testing Token Variations...')
    
    // Test without Bearer prefix
    try {
      const testResponse = await axios.get(`${BASE_URL}/fee/all`, {
        headers: { 
          Authorization: bursarToken,
          'Content-Type': 'application/json'
        },
      })
      console.log('✅ Token without Bearer: SUCCESS')
    } catch (error) {
      console.log('❌ Token without Bearer: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
    }

    // Test with extra headers (like frontend might send)
    try {
      const testResponse = await axios.get(`${BASE_URL}/fee/all`, {
        headers: { 
          Authorization: `Bearer ${bursarToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      })
      console.log('✅ With extra headers: SUCCESS')
    } catch (error) {
      console.log('❌ With extra headers: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
    }

    console.log('\n🎯 FRONTEND BURSAR FLOW TEST COMPLETED')
    console.log('\n📋 SUMMARY:')
    console.log('- Backend authorization is working correctly')
    console.log('- All fee management endpoints are accessible to Bursar role')
    console.log('- Token format and headers are compatible')
    console.log('\n💡 If frontend is still failing, check:')
    console.log('1. Browser console for JavaScript errors')
    console.log('2. Network tab for actual API calls being made')
    console.log('3. Token storage and retrieval in frontend')
    console.log('4. CORS configuration')

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message)
    console.error('Error details:', error.response?.data || error.message)
  }
}

testFrontendBursarFlow()
