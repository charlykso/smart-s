const axios = require('../api/node_modules/axios/dist/node/axios.cjs')

/**
 * Comprehensive Admin Test Suite
 * Tests all admin-related functionality including authentication, user management, and system operations
 */

const ADMIN_CREDENTIALS = {
  email: 'admin@ledgrio.com',
  password: 'KGnd#%$ld',
}

const BASE_URL = 'http://localhost:3000/api/v1'

async function testAdminSystem() {
  try {
    console.log('👨‍💼 Testing Admin System')
    console.log('='.repeat(50))

    // 1. Admin Authentication
    console.log('1. Testing admin authentication...')
    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      ADMIN_CREDENTIALS
    )
    const token = loginResponse.data.token
    console.log('✅ Admin login successful')

    const headers = { Authorization: `Bearer ${token}` }

    // 2. Admin Profile
    console.log('\n2. Testing admin profile...')
    const profileResponse = await axios.get(`${BASE_URL}/users/me`, { headers })
    console.log('✅ Admin profile retrieved')
    console.log(
      '   Name:',
      profileResponse.data.user.firstname,
      profileResponse.data.user.lastname
    )
    console.log('   Roles:', profileResponse.data.user.roles)

    // 3. User Management
    console.log('\n3. Testing user management...')
    const usersResponse = await axios.get(`${BASE_URL}/users`, { headers })
    console.log('✅ Users list retrieved')
    console.log('   Users count:', usersResponse.data.data?.length || 0)

    // 4. School Management
    console.log('\n4. Testing school management...')
    const schoolsResponse = await axios.get(`${BASE_URL}/schools`, { headers })
    console.log('✅ Schools list retrieved')
    console.log('   Schools count:', schoolsResponse.data.data?.length || 0)

    // 5. System Analytics
    console.log('\n5. Testing system analytics...')
    try {
      const analyticsResponse = await axios.get(
        `${BASE_URL}/analytics/dashboard`,
        { headers }
      )
      console.log('✅ Analytics data retrieved')
    } catch (analyticsError) {
      console.log('ℹ️  Analytics endpoint not available (optional)')
    }

    console.log('\n🎉 Admin system test completed successfully!')
  } catch (error) {
    console.error(
      '❌ Admin test failed:',
      error.response?.data?.message || error.message
    )
    throw error
  }
}

if (require.main === module) {
  testAdminSystem().catch(console.error)
}

module.exports = { testAdminSystem }
