const axios = require('axios')
require('dotenv').config()

const BASE_URL = 'http://localhost:3000/api/v1'

async function debugFeeAuth() {
  console.log('🔍 Debugging Fee Management Authentication...\n')

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
    console.log('🔑 Token:', token.substring(0, 50) + '...')
    console.log('👤 User roles:', loginResponse.data.data.user.roles)

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    // 2. Test GET /fee/get-approved-fees with detailed error info
    console.log('\n2. Testing GET /fee/get-approved-fees...')
    try {
      const response = await axios.get(`${BASE_URL}/fee/get-approved-fees`, {
        headers,
      })
      console.log(`✅ Success! Response:`, response.data)
    } catch (error) {
      console.log(`❌ Failed with status: ${error.response?.status}`)
      console.log(
        `❌ Error message: ${error.response?.data?.message || error.message}`
      )
      console.log(`❌ Full response data:`, error.response?.data)
    }

    // 3. Test POST /fee/create with detailed error info
    console.log('\n3. Testing POST /fee/create...')
    try {
      const newFee = {
        name: 'Test Fee',
        amount: 5000,
        description: 'Test fee for debugging',
        class: 'JSS 1',
        term: 'First Term',
        session: '2024/2025',
      }

      const response = await axios.post(`${BASE_URL}/fee/create`, newFee, {
        headers,
      })
      console.log(`✅ Success! Fee created:`, response.data)
    } catch (error) {
      console.log(`❌ Failed with status: ${error.response?.status}`)
      console.log(
        `❌ Error message: ${error.response?.data?.message || error.message}`
      )
      console.log(`❌ Full response data:`, error.response?.data)
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
  }
}

debugFeeAuth()
