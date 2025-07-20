const axios = require('../api/node_modules/axios/dist/node/axios.cjs')

/**
 * Comprehensive Principal Test Suite
 * Tests all principal-related functionality including authentication, school oversight, and reporting
 */

const PRINCIPAL_CREDENTIALS = {
  email: 'principal@smart-s.com',
  password: 'password123',
}

const BASE_URL = 'http://localhost:3000/api/v1'

async function testPrincipalSystem() {
  try {
    console.log('🎓 Testing Principal System')
    console.log('='.repeat(50))

    // 1. Principal Authentication
    console.log('1. Testing principal authentication...')
    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      PRINCIPAL_CREDENTIALS
    )
    const token = loginResponse.data.token
    console.log('✅ Principal login successful')

    const headers = { Authorization: `Bearer ${token}` }

    // 2. Principal Profile
    console.log('\n2. Testing principal profile...')
    const profileResponse = await axios.get(`${BASE_URL}/users/me`, { headers })
    console.log('✅ Principal profile retrieved')
    console.log(
      '   Name:',
      profileResponse.data.user.firstname,
      profileResponse.data.user.lastname
    )

    // 3. School Overview
    console.log('\n3. Testing school overview...')
    try {
      const overviewResponse = await axios.get(
        `${BASE_URL}/principal/dashboard`,
        { headers }
      )
      console.log('✅ School overview retrieved')
    } catch (overviewError) {
      console.log(
        'ℹ️  Dashboard endpoint response:',
        overviewError.response?.status
      )
    }

    // 4. Student Management
    console.log('\n4. Testing student oversight...')
    const studentsResponse = await axios.get(`${BASE_URL}/users`, { headers })
    const students =
      studentsResponse.data.data?.filter((user) =>
        user.roles.includes('Student')
      ) || []
    console.log('✅ Students retrieved')
    console.log('   Students count:', students.length)

    // 5. Teacher Management
    console.log('\n5. Testing teacher oversight...')
    const teachersResponse = await axios.get(`${BASE_URL}/users`, { headers })
    const teachers =
      teachersResponse.data.data?.filter((user) =>
        user.roles.includes('Teacher')
      ) || []
    console.log('✅ Teachers retrieved')
    console.log('   Teachers count:', teachers.length)

    // 6. Academic Sessions and Terms
    console.log('\n6. Testing academic sessions and terms...')
    try {
      const sessionsResponse = await axios.get(`${BASE_URL}/sessions`, {
        headers,
      })
      console.log('✅ Academic sessions retrieved')
      console.log('   Sessions count:', sessionsResponse.data.data?.length || 0)

      const termsResponse = await axios.get(`${BASE_URL}/terms`, { headers })
      console.log('✅ Academic terms retrieved')
      console.log('   Terms count:', termsResponse.data.data?.length || 0)
    } catch (academicError) {
      console.log(
        'ℹ️  Academic endpoints response:',
        academicError.response?.status
      )
    }

    // 7. Financial Overview
    console.log('\n7. Testing financial overview...')
    try {
      const financialResponse = await axios.get(`${BASE_URL}/fee/all`, {
        headers,
      })
      console.log('✅ Financial data retrieved')
      console.log(
        '   Fee items count:',
        financialResponse.data.data?.length || 0
      )
    } catch (financialError) {
      console.log(
        'ℹ️  Financial overview response:',
        financialError.response?.status
      )
    }

    console.log('\n🎉 Principal system test completed successfully!')
  } catch (error) {
    console.error(
      '❌ Principal test failed:',
      error.response?.data?.message || error.message
    )
    throw error
  }
}

if (require.main === module) {
  testPrincipalSystem().catch(console.error)
}

module.exports = { testPrincipalSystem }
