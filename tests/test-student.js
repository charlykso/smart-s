const axios = require('../api/node_modules/axios/dist/node/axios.cjs')

/**
 * Comprehensive Student Test Suite
 * Tests all student-related functionality including authentication, dashboard, fees, and payments
 */

const STUDENT_CREDENTIALS = {
  email: 'student@smart-s.com',
  password: 'password123',
}

const BASE_URL = 'http://localhost:3000/api/v1'

async function testStudentSystem() {
  try {
    console.log('🎓 Testing Student System')
    console.log('='.repeat(50))

    // 1. Student Authentication
    console.log('1. Testing student authentication...')
    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      STUDENT_CREDENTIALS
    )
    const token = loginResponse.data.token
    console.log('✅ Student login successful')

    const headers = { Authorization: `Bearer ${token}` }

    // 2. Student Profile
    console.log('\n2. Testing student profile...')
    const profileResponse = await axios.get(`${BASE_URL}/users/me`, { headers })
    console.log('✅ Student profile retrieved')
    console.log(
      '   Name:',
      profileResponse.data.user.firstname,
      profileResponse.data.user.lastname
    )
    console.log('   Email:', profileResponse.data.user.email)

    // 3. Student Fees
    console.log('\n3. Testing student fees...')
    const feesResponse = await axios.get(`${BASE_URL}/student/fees`, {
      headers,
    })
    console.log('✅ Student fees retrieved')
    console.log('   Fees count:', feesResponse.data.data?.length || 0)

    // 4. Student Payments
    console.log('\n4. Testing student payments...')
    const paymentsResponse = await axios.get(`${BASE_URL}/student/payments`, {
      headers,
    })
    console.log('✅ Student payments retrieved')
    console.log('   Payments count:', paymentsResponse.data.data?.length || 0)

    // 5. Outstanding Fees
    console.log('\n5. Testing outstanding fees calculation...')
    const outstandingResponse = await axios.get(
      `${BASE_URL}/student/outstanding-fees`,
      { headers }
    )
    console.log('✅ Outstanding fees calculated')
    console.log(
      '   Outstanding amount:',
      outstandingResponse.data.data?.totalOutstanding || 0
    )

    console.log('\n🎉 Student system test completed successfully!')
  } catch (error) {
    console.error(
      '❌ Student test failed:',
      error.response?.data?.message || error.message
    )
    throw error
  }
}

if (require.main === module) {
  testStudentSystem().catch(console.error)
}

module.exports = { testStudentSystem }
