const axios = require('axios')
require('dotenv').config()

const BASE_URL = 'http://localhost:3000/api/v1'

async function testRoleBasedAccess() {
  console.log('🧪 Testing Role-Based Fee Access...\n')

  try {
    // Test with bursar
    console.log('1. Testing Bursar Access...')
    const bursarLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bursar@smart-s.com',
      password: 'password123',
    })
    const bursarToken = bursarLogin.data.data.token
    const bursarHeaders = { Authorization: `Bearer ${bursarToken}` }

    console.log(
      `   Bursar roles: ${JSON.stringify(bursarLogin.data.data.user.roles)}`
    )

    // Test endpoints that should work for bursar
    const bursarEndpoints = [
      '/fee/all',
      '/fee/get-approved-fees',
      '/fee/get-unapproved-fees',
    ]

    for (const endpoint of bursarEndpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: bursarHeaders,
        })
        console.log(`   ✅ ${endpoint} - SUCCESS (${response.status})`)
      } catch (error) {
        console.log(
          `   ❌ ${endpoint} - FAILED (${error.response?.status}) - ${
            error.response?.data?.message || error.message
          }`
        )
      }
    }

    // Test with principal
    console.log('\n2. Testing Principal Access...')
    const principalLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'principal@smart-s.com',
      password: 'password123',
    })
    const principalToken = principalLogin.data.data.token
    const principalHeaders = { Authorization: `Bearer ${principalToken}` }

    console.log(
      `   Principal roles: ${JSON.stringify(
        principalLogin.data.data.user.roles
      )}`
    )

    // Test endpoints that should work for principal
    const principalEndpoints = [
      '/fee/all',
      '/fee/get-approved-fees',
      '/fee/get-unapproved-fees',
    ]

    for (const endpoint of principalEndpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: principalHeaders,
        })
        console.log(`   ✅ ${endpoint} - SUCCESS (${response.status})`)
      } catch (error) {
        console.log(
          `   ❌ ${endpoint} - FAILED (${error.response?.status}) - ${
            error.response?.data?.message || error.message
          }`
        )
      }
    }

    console.log('\n3. Role Summary:')
    console.log(
      '   Bursar role in roleList:',
      require('../helpers/roleList').Bursar
    )
    console.log(
      '   Principal role in roleList:',
      require('../helpers/roleList').Principal
    )
    console.log(
      '   Available roles in roleList:',
      Object.keys(require('../helpers/roleList'))
    )
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testRoleBasedAccess()
