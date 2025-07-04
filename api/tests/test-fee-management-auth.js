const axios = require('axios')
require('dotenv').config()

const BASE_URL = 'http://localhost:3000/api/v1'

async function testFeeManagementAuth() {
  console.log('🧪 Testing Fee Management Authentication...\n')

  try {
    // 1. Login as bursar
    console.log('1. Logging in as bursar...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bursar@smart-s.com',
      password: 'password123',
    })

    if (!loginResponse.data.success) {
      throw new Error('Bursar login failed')
    }

    const token = loginResponse.data.data.token
    console.log('✅ Bursar login successful')

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    // 2. Test GET /fee/all
    console.log('\n2. Testing GET /fee/all...')
    try {
      const feesResponse = await axios.get(`${BASE_URL}/fee/all`, { headers })
      console.log(
        `✅ GET /fee/all successful - Found ${feesResponse.data.length} fees`
      )
    } catch (error) {
      console.log(
        `❌ GET /fee/all failed: ${
          error.response?.data?.message || error.message
        }`
      )
    }

    // 3. Test GET /fee/get-approved-fees
    console.log('\n3. Testing GET /fee/get-approved-fees...')
    try {
      const approvedFeesResponse = await axios.get(
        `${BASE_URL}/fee/get-approved-fees`,
        { headers }
      )
      console.log(`✅ GET /fee/get-approved-fees successful`)
    } catch (error) {
      console.log(
        `❌ GET /fee/get-approved-fees failed: ${
          error.response?.data?.message || error.message
        }`
      )
    }

    // 4. Test GET /fee/get-unapproved-fees
    console.log('\n4. Testing GET /fee/get-unapproved-fees...')
    try {
      const unapprovedFeesResponse = await axios.get(
        `${BASE_URL}/fee/get-unapproved-fees`,
        { headers }
      )
      console.log(`✅ GET /fee/get-unapproved-fees successful`)
    } catch (error) {
      console.log(
        `❌ GET /fee/get-unapproved-fees failed: ${
          error.response?.data?.message || error.message
        }`
      )
    }

    // 5. Test POST /fee/create
    console.log('\n5. Testing POST /fee/create...')
    try {
      const newFee = {
        name: 'Test Fee',
        amount: 5000,
        description: 'Test fee for authentication testing',
        class: 'JSS 1',
        term: 'First Term',
        session: '2024/2025',
      }

      const createResponse = await axios.post(
        `${BASE_URL}/fee/create`,
        newFee,
        { headers }
      )
      console.log(
        `✅ POST /fee/create successful - Fee ID: ${createResponse.data._id}`
      )

      // Store the fee ID for testing update/delete
      const testFeeId = createResponse.data._id

      // 6. Test PUT /fee/:id/update
      console.log('\n6. Testing PUT /fee/:id/update...')
      try {
        const updateData = {
          name: 'Updated Test Fee',
          amount: 6000,
        }
        const updateResponse = await axios.put(
          `${BASE_URL}/fee/${testFeeId}/update`,
          updateData,
          { headers }
        )
        console.log(`✅ PUT /fee/${testFeeId}/update successful`)
      } catch (error) {
        console.log(
          `❌ PUT /fee/${testFeeId}/update failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }

      // 7. Test DELETE /fee/:id/delete
      console.log('\n7. Testing DELETE /fee/:id/delete...')
      try {
        const deleteResponse = await axios.delete(
          `${BASE_URL}/fee/${testFeeId}/delete`,
          { headers }
        )
        console.log(`✅ DELETE /fee/${testFeeId}/delete successful`)
      } catch (error) {
        console.log(
          `❌ DELETE /fee/${testFeeId}/delete failed: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    } catch (error) {
      console.log(
        `❌ POST /fee/create failed: ${
          error.response?.data?.message || error.message
        }`
      )
    }

    console.log('\n🎉 Fee Management Authentication Test Complete!')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
  }
}

// Test without authentication
async function testWithoutAuth() {
  console.log(
    '\n🔒 Testing endpoints without authentication (should fail)...\n'
  )

  const endpoints = [
    { method: 'GET', url: `${BASE_URL}/fee/all` },
    { method: 'GET', url: `${BASE_URL}/fee/get-approved-fees` },
    {
      method: 'POST',
      url: `${BASE_URL}/fee/create`,
      data: { name: 'Test', amount: 1000 },
    },
  ]

  for (const endpoint of endpoints) {
    try {
      const config = {
        method: endpoint.method.toLowerCase(),
        url: endpoint.url,
        data: endpoint.data,
      }
      await axios(config)
      console.log(
        `❌ ${endpoint.method} ${endpoint.url} - Should have failed but didn't!`
      )
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(
          `✅ ${endpoint.method} ${endpoint.url} - Correctly blocked (401)`
        )
      } else {
        console.log(
          `⚠️ ${endpoint.method} ${endpoint.url} - Failed with: ${error.response?.status} ${error.response?.data?.message}`
        )
      }
    }
  }
}

async function runAllTests() {
  await testFeeManagementAuth()
  await testWithoutAuth()
}

// Execute if run directly
if (require.main === module) {
  runAllTests()
}

module.exports = { testFeeManagementAuth, testWithoutAuth }
