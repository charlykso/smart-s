const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testBursarFeeAccess() {
  console.log('🔍 TESTING BURSAR FEE ACCESS AUTHORIZATION')
  console.log('==================================================')

  try {
    // Step 1: Login as Bursar
    console.log('\nStep 1: Logging in as Bursar...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bursar@smart-s.com',
      password: 'password123',
    })

    if (!loginResponse.data.success) {
      throw new Error('Bursar login failed: ' + loginResponse.data.message)
    }

    const bursarToken =
      loginResponse.data.data?.token || loginResponse.data.token
    const bursarUser = loginResponse.data.data?.user || loginResponse.data.user
    console.log('✅ Bursar logged in successfully')
    console.log('Login response data:', Object.keys(loginResponse.data))
    console.log(
      'Bursar user:',
      bursarUser ? Object.keys(bursarUser) : 'No user data'
    )
    if (bursarUser) {
      console.log('Bursar roles:', bursarUser.roles)
      console.log('Bursar school:', bursarUser.school?.name || 'No school')
    }

    // Step 2: Test Bursar Dashboard
    console.log('\nStep 2: Testing Bursar Dashboard...')
    try {
      const dashboardResponse = await axios.get(
        `${BASE_URL}/bursar/dashboard`,
        {
          headers: { Authorization: `Bearer ${bursarToken}` },
        }
      )
      console.log('✅ Bursar dashboard access: SUCCESS')
      console.log('Dashboard data keys:', Object.keys(dashboardResponse.data))
    } catch (error) {
      console.log('❌ Bursar dashboard access: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
      console.log('Status:', error.response?.status)
    }

    // Step 3: Test Fee Management Endpoints
    console.log('\nStep 3: Testing Fee Management Endpoints...')

    // Test get all fees
    try {
      const feesResponse = await axios.get(`${BASE_URL}/fee/all`, {
        headers: { Authorization: `Bearer ${bursarToken}` },
      })
      console.log('✅ Get all fees: SUCCESS')
      console.log('Number of fees:', feesResponse.data.length)
    } catch (error) {
      console.log('❌ Get all fees: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
      console.log('Status:', error.response?.status)
    }

    // Test get approved fees
    try {
      const approvedFeesResponse = await axios.get(
        `${BASE_URL}/fee/get-approved-fees`,
        {
          headers: { Authorization: `Bearer ${bursarToken}` },
        }
      )
      console.log('✅ Get approved fees: SUCCESS')
      console.log('Number of approved fees:', approvedFeesResponse.data.length)
    } catch (error) {
      console.log('❌ Get approved fees: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
      console.log('Status:', error.response?.status)
    }

    // Test get unapproved fees
    try {
      const unapprovedFeesResponse = await axios.get(
        `${BASE_URL}/fee/get-unapproved-fees`,
        {
          headers: { Authorization: `Bearer ${bursarToken}` },
        }
      )
      console.log('✅ Get unapproved fees: SUCCESS')
      console.log(
        'Number of unapproved fees:',
        unapprovedFeesResponse.data.length
      )
    } catch (error) {
      console.log('❌ Get unapproved fees: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
      console.log('Status:', error.response?.status)
    }

    // Test create fee
    try {
      const createFeeResponse = await axios.post(
        `${BASE_URL}/fee/create`,
        {
          name: 'Test Fee for Bursar',
          amount: 5000,
          type: 'tuition',
          description: 'Test fee created by bursar',
          dueDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days from now
          isApproved: false,
          isActive: true,
        },
        {
          headers: { Authorization: `Bearer ${bursarToken}` },
        }
      )
      console.log('✅ Create fee: SUCCESS')
      console.log(
        'Created fee ID:',
        createFeeResponse.data.data?._id || 'No ID returned'
      )
    } catch (error) {
      console.log('❌ Create fee: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
      console.log('Status:', error.response?.status)
    }

    // Step 4: Test Payment Reports
    console.log('\nStep 4: Testing Payment Reports...')
    try {
      const paymentReportsResponse = await axios.get(
        `${BASE_URL}/bursar/payment-reports`,
        {
          headers: { Authorization: `Bearer ${bursarToken}` },
        }
      )
      console.log('✅ Payment reports: SUCCESS')
      console.log(
        'Reports data keys:',
        Object.keys(paymentReportsResponse.data)
      )
    } catch (error) {
      console.log('❌ Payment reports: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
      console.log('Status:', error.response?.status)
    }

    // Step 5: Test Outstanding Fees Report
    console.log('\nStep 5: Testing Outstanding Fees Report...')
    try {
      const outstandingFeesResponse = await axios.get(
        `${BASE_URL}/bursar/outstanding-fees-report`,
        {
          headers: { Authorization: `Bearer ${bursarToken}` },
        }
      )
      console.log('✅ Outstanding fees report: SUCCESS')
      console.log(
        'Report data keys:',
        Object.keys(outstandingFeesResponse.data)
      )
    } catch (error) {
      console.log('❌ Outstanding fees report: FAILED')
      console.log('Error:', error.response?.data?.message || error.message)
      console.log('Status:', error.response?.status)
    }

    console.log('\n🎯 BURSAR FEE ACCESS TEST COMPLETED')
  } catch (error) {
    console.error(
      '❌ Test failed:',
      error.response?.data?.message || error.message
    )
    console.error('Error details:', error.response?.data || error.message)
  }
}

testBursarFeeAccess()
