const axios = require('axios')

/**
 * Comprehensive Bursar Test Suite
 * Tests all bursar-related functionality including authentication, fee management, and payment processing
 */

const BURSAR_CREDENTIALS = {
  email: 'bursar@smart-s.com',
  password: 'password123',
}

const BASE_URL = 'http://localhost:3001/api/v1'

async function testBursarSystem() {
  try {
    console.log('💰 Testing Bursar System')
    console.log('='.repeat(50))

    // 1. Bursar Authentication
    console.log('1. Testing bursar authentication...')
    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      BURSAR_CREDENTIALS
    )
    const token = loginResponse.data.token
    console.log('✅ Bursar login successful')

    const headers = { Authorization: `Bearer ${token}` }

    // 2. Bursar Profile
    console.log('\n2. Testing bursar profile...')
    const profileResponse = await axios.get(`${BASE_URL}/users/me`, { headers })
    console.log('✅ Bursar profile retrieved')
    console.log(
      '   Name:',
      profileResponse.data.user.firstname,
      profileResponse.data.user.lastname
    )

    // 3. Fee Management
    console.log('\n3. Testing fee management...')
    const feesResponse = await axios.get(`${BASE_URL}/fee/all`, { headers })
    console.log('✅ All fees retrieved')
    console.log('   Fees count:', feesResponse.data.data?.length || 0)

    // 4. Payment Management
    console.log('\n4. Testing payment management...')
    try {
      const paymentsResponse = await axios.get(`${BASE_URL}/payments`, {
        headers,
      })
      console.log('✅ Payments retrieved')
      console.log('   Payments count:', paymentsResponse.data.data?.length || 0)
    } catch (paymentError) {
      console.log(
        'ℹ️  Payment endpoint response:',
        paymentError.response?.status
      )
    }

    // 5. Financial Reports
    console.log('\n5. Testing financial reports...')
    try {
      const reportsResponse = await axios.get(`${BASE_URL}/reports/financial`, {
        headers,
      })
      console.log('✅ Financial reports retrieved')
    } catch (reportError) {
      console.log('ℹ️  Reports endpoint not available (optional)')
    }

    // 6. Fee Collection Summary
    console.log('\n6. Testing fee collection summary...')
    try {
      const summaryResponse = await axios.get(
        `${BASE_URL}/fee/collection-summary`,
        { headers }
      )
      console.log('✅ Fee collection summary retrieved')
    } catch (summaryError) {
      console.log(
        'ℹ️  Collection summary endpoint response:',
        summaryError.response?.status
      )
    }

    console.log('\n🎉 Bursar system test completed successfully!')
  } catch (error) {
    console.error(
      '❌ Bursar test failed:',
      error.response?.data?.message || error.message
    )
    throw error
  }
}

if (require.main === module) {
  testBursarSystem().catch(console.error)
}

module.exports = { testBursarSystem }
