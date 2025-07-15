const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

async function testFrontendLogin() {
  console.log('🔍 Testing Frontend Login Flow...\n')

  try {
    // Test the exact same flow that the frontend uses
    console.log('1. Testing login endpoint...')
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teststudent@test.com',
      password: 'password123'
    })

    console.log('✅ Login successful')
    console.log('Response structure:')
    console.log('- success:', loginResponse.data.success)
    console.log('- message:', loginResponse.data.message)
    console.log('- data keys:', Object.keys(loginResponse.data.data))
    console.log('- user ID:', loginResponse.data.data.user._id)
    console.log('- token length:', loginResponse.data.data.token.length)
    console.log('- refreshToken length:', loginResponse.data.data.refreshToken.length)

    // Test what the frontend AuthService would receive
    const apiServiceResponse = loginResponse.data // This is what ApiService.post returns
    console.log('\n2. What AuthService receives:')
    console.log('- apiServiceResponse.success:', apiServiceResponse.success)
    console.log('- apiServiceResponse.data keys:', Object.keys(apiServiceResponse.data))
    
    // This is what AuthService.login should return
    const authResponse = apiServiceResponse.data
    console.log('\n3. What AuthService.login should return:')
    console.log('- authResponse keys:', Object.keys(authResponse))
    console.log('- has user:', !!authResponse.user)
    console.log('- has token:', !!authResponse.token)
    console.log('- has refreshToken:', !!authResponse.refreshToken)

    console.log('\n✅ Frontend login flow structure is correct!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

testFrontendLogin()
