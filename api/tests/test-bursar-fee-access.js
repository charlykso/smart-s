const axios = require('axios')
require('dotenv').config()

const BASE_URL = 'http://localhost:3000/api/v1'

async function testBursarFeeAccess() {
  console.log('🧪 Testing Bursar Fee Management Access...\n')

  try {
    // Step 1: Login as bursar
    console.log('1. Logging in as bursar...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bursar@smart-s.com',
      password: 'password123',
    })

    if (!loginResponse.data.success) {
      throw new Error('Login failed')
    }

    const token = loginResponse.data.data.token
    const user = loginResponse.data.data.user
    console.log(`✅ Login successful`)
    console.log(`   User: ${user.firstname} ${user.lastname}`)
    console.log(`   Roles: ${JSON.stringify(user.roles)}`)
    console.log(`   School: ${user.school?.name || 'No school'}`)
    console.log(`   Token: ${token.substring(0, 20)}...`)

    // Step 2: Test fee endpoints
    const headers = { Authorization: `Bearer ${token}` }

    const endpoints = [
      { name: 'Get All Fees', method: 'GET', url: '/fee/all' },
      {
        name: 'Get Approved Fees',
        method: 'GET',
        url: '/fee/get-approved-fees',
      },
      {
        name: 'Get Unapproved Fees',
        method: 'GET',
        url: '/fee/get-unapproved-fees',
      },
      {
        name: 'Create Fee',
        method: 'POST',
        url: '/fee/create',
        data: {
          name: 'Test Fee',
          amount: 5000,
          description: 'Test fee for debugging',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          school_id: user.school._id,
          term_id: '60a7e8b8b8b8b8b8b8b8b8b8', // Mock term ID
          isApproved: false,
        },
      },
    ]

    console.log('\n2. Testing fee management endpoints...')

    for (const endpoint of endpoints) {
      try {
        console.log(`\n   Testing: ${endpoint.name}`)
        console.log(`   ${endpoint.method} ${endpoint.url}`)

        let response
        if (endpoint.method === 'POST') {
          response = await axios.post(
            `${BASE_URL}${endpoint.url}`,
            endpoint.data,
            { headers }
          )
        } else {
          response = await axios.get(`${BASE_URL}${endpoint.url}`, { headers })
        }

        console.log(`   ✅ SUCCESS (${response.status})`)
        if (endpoint.name === 'Get All Fees') {
          console.log(`      Found ${response.data.length || 0} fees`)
        }
      } catch (error) {
        console.log(
          `   ❌ FAILED (${error.response?.status || 'Network Error'})`
        )
        console.log(
          `      Error: ${error.response?.data?.message || error.message}`
        )

        // Show more details for debugging
        if (error.response?.status === 401) {
          console.log(
            `      Headers sent: Authorization: Bearer ${token.substring(
              0,
              20
            )}...`
          )
          console.log(`      Response headers:`, error.response.headers)
        }
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
    }
  }
}

// Run the test
testBursarFeeAccess()
