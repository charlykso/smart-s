const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

async function testBursarResponse() {
  console.log('🔍 Testing Bursar Response Structure...\n')

  try {
    // Login as bursar
    const bursarLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'bursar@smartschool.edu',
      password: 'password123'
    })

    const bursarToken = bursarLogin.data.data.token
    const bursarHeaders = {
      'Authorization': `Bearer ${bursarToken}`,
      'Content-Type': 'application/json'
    }

    // Test bursar dashboard response structure
    console.log('1. Testing bursar dashboard response...')
    const dashboardResponse = await axios.get(`${API_BASE}/bursar/dashboard`, { headers: bursarHeaders })
    
    console.log('Raw response structure:')
    console.log('- response.data keys:', Object.keys(dashboardResponse.data))
    console.log('- response.data.success:', dashboardResponse.data.success)
    console.log('- response.data.data keys:', Object.keys(dashboardResponse.data.data || {}))
    
    // This is what ApiService.get returns (response.data)
    const apiServiceResponse = dashboardResponse.data
    console.log('\nWhat ApiService.get returns:')
    console.log('- success:', apiServiceResponse.success)
    console.log('- has data:', !!apiServiceResponse.data)
    
    // This is what BursarService should return
    const bursarServiceResponse = apiServiceResponse.data
    console.log('\nWhat BursarService should return:')
    console.log('- bursar:', bursarServiceResponse.bursar?.firstname, bursarServiceResponse.bursar?.lastname)
    console.log('- school:', bursarServiceResponse.school?.name)
    console.log('- financialStats keys:', Object.keys(bursarServiceResponse.financialStats || {}))
    console.log('- totalRevenue:', bursarServiceResponse.financialStats?.totalRevenue)

    console.log('\n✅ Response structure analysis complete!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

testBursarResponse()
