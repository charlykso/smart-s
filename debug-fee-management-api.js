const axios = require('axios')

// Debug the Fee Management API endpoint
async function debugFeeManagementAPI() {
  try {
    // Get authentication token first
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'admin@smart-s.com',
        password: 'password123',
      }
    )

    const token = loginResponse.data.data.token
    console.log('✓ Authentication successful')

    // Test the /fee/all endpoint (used by Fee Management page)
    const feeResponse = await axios.get(
      'http://localhost:3000/api/v1/fee/all',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    console.log('\n=== /fee/all Response ===')
    console.log('Status:', feeResponse.status)
    console.log('Data type:', typeof feeResponse.data)
    console.log('Is array:', Array.isArray(feeResponse.data))

    if (feeResponse.data) {
      console.log('Response structure:')
      console.log('- Keys:', Object.keys(feeResponse.data).slice(0, 5))
      console.log('- Length (if array):', feeResponse.data.length)
      console.log(
        '- First few items:',
        Array.isArray(feeResponse.data)
          ? feeResponse.data.slice(0, 2)
          : 'Not an array'
      )
    } else {
      console.log('Response is null/undefined')
    }

    // Test successful scenario
    if (Array.isArray(feeResponse.data)) {
      console.log('\n✓ API returns array - fees.filter() should work')
    } else {
      console.log('\n✗ API does not return array - fees.filter() will fail')
      console.log('  Actual response:', feeResponse.data)
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

debugFeeManagementAPI()
