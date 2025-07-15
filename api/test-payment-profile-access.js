const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

async function testPaymentProfileAccess() {
  console.log('🔍 Testing Payment Profile Access...\n')

  try {
    // Login as bursar
    console.log('1. Logging in as bursar...')
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'bursar@smartschool.edu',
      password: 'password123'
    })

    const authData = loginResponse.data.data
    const token = authData.token
    const user = authData.user

    console.log('✅ Login successful')
    console.log('- User roles:', user.roles)
    console.log('- School ID:', user.school?._id)

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    // Test different payment profile endpoints
    const endpoints = [
      { name: 'All Payment Profiles', url: `${API_BASE}/paymentProfile/all` },
      { name: 'School Payment Profiles', url: `${API_BASE}/paymentProfile/all/${user.school._id}` },
      { name: 'Create Payment Profile', method: 'POST', url: `${API_BASE}/paymentProfile/create`, data: {
        school_id: user.school._id,
        account_no: '1234567890',
        account_name: 'Test Account',
        bank_name: 'Test Bank',
        activate_ps: false,
        activate_fw: false
      }}
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`\n2. Testing ${endpoint.name}...`)
        let response
        if (endpoint.method === 'POST') {
          response = await axios.post(endpoint.url, endpoint.data, { headers })
        } else {
          response = await axios.get(endpoint.url, { headers })
        }
        console.log(`✅ ${endpoint.name}: ${response.status}`)
        console.log('   Response:', response.data.success ? 'Success' : 'Failed')
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.response?.status} - ${error.response?.data?.message || error.message}`)
        console.log('   Full error:', error.response?.data)
      }
    }

    console.log('\n✅ Payment profile access test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

testPaymentProfileAccess()
