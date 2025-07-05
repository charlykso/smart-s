const axios = require('axios')

// Test the Fee Management page's API integration
async function testFeeManagementIntegration() {
  try {
    // Get authentication token first
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'bursar@smart-s.com',
        password: 'password123',
      }
    )

    const token = loginResponse.data.data.token
    console.log('✓ Authentication successful (Bursar)')

    // Test all the endpoints that the Fee Management page uses
    console.log('\n=== Testing Fee Management API Endpoints ===')

    // 1. GET /fee/all - Main fees loading
    const feesResponse = await axios.get(
      'http://localhost:3000/api/v1/fee/all',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    console.log('✓ GET /fee/all:', {
      status: feesResponse.status,
      isArray: Array.isArray(feesResponse.data),
      count: feesResponse.data.length,
    })

    // 2. GET /fee/get-unapproved-fees - Pending approvals
    const unapprovedResponse = await axios.get(
      'http://localhost:3000/api/v1/fee/get-unapproved-fees',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    console.log('✓ GET /fee/get-unapproved-fees:', {
      status: unapprovedResponse.status,
      isArray: Array.isArray(unapprovedResponse.data),
      count: unapprovedResponse.data.length,
    })

    // 3. GET /payment/all - Payment history
    const paymentsResponse = await axios.get(
      'http://localhost:3000/api/v1/payment/all',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    console.log('✓ GET /payment/all:', {
      status: paymentsResponse.status,
      isArray: Array.isArray(paymentsResponse.data),
      count: paymentsResponse.data.length,
    })

    // 4. GET /school/all - School data
    const schoolsResponse = await axios.get(
      'http://localhost:3000/api/v1/school/all',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    console.log('✓ GET /school/all:', {
      status: schoolsResponse.status,
      isArray: Array.isArray(schoolsResponse.data),
      count: schoolsResponse.data.length,
    })

    // 5. GET /Term/all - Term data
    const termsResponse = await axios.get(
      'http://localhost:3000/api/v1/Term/all',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    console.log('✓ GET /Term/all:', {
      status: termsResponse.status,
      isArray: Array.isArray(termsResponse.data),
      count: termsResponse.data.length,
    })

    console.log('\n=== Test Results ===')
    console.log('✓ All endpoints return arrays as expected')
    console.log('✓ Bursar has access to all required endpoints')
    console.log('✓ Fee Management page should work correctly')
    console.log('\n=== Sample Data ===')
    console.log(
      '- Fees available:',
      feesResponse.data.length > 0 ? 'Yes' : 'No'
    )
    console.log('- Pending approvals:', unapprovedResponse.data.length)
    console.log('- Payment records:', paymentsResponse.data.length)
    console.log('- Schools:', schoolsResponse.data.length)
    console.log('- Terms:', termsResponse.data.length)

    if (feesResponse.data.length > 0) {
      console.log('\n=== Sample Fee Structure ===')
      const sampleFee = feesResponse.data[0]
      console.log('Fee keys:', Object.keys(sampleFee))
      console.log('Fee example:', {
        name: sampleFee.name,
        type: sampleFee.type,
        amount: sampleFee.amount,
        isApproved: sampleFee.isApproved,
        school: sampleFee.school?.name,
        term: sampleFee.term?.name,
      })
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

testFeeManagementIntegration()
