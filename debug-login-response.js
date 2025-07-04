#!/usr/bin/env node

/**
 * Debug Login Response Structure
 */

const baseURL = 'http://localhost:3001/api/v1'

async function testLogin() {
  console.log('🔍 Testing Student Login Response Structure...\n')

  try {
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'alice.student@smartschool.edu',
        password: 'password123',
      }),
    })

    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('✅ Login successful!')
      console.log('📝 Full response structure:')
      console.log(JSON.stringify(loginData, null, 2))

      // Check different possible structures
      console.log('\n🔍 Checking response structure:')
      console.log('   - loginData.user:', !!loginData.user)
      console.log('   - loginData.data:', !!loginData.data)
      console.log(
        '   - loginData.data.user:',
        !!(loginData.data && loginData.data.user)
      )
      console.log('   - loginData.accessToken:', !!loginData.accessToken)
      console.log(
        '   - loginData.data.token:',
        !!(loginData.data && loginData.data.token)
      )
      console.log('   - loginData.token:', !!loginData.token)
    } else {
      const errorData = await loginResponse.text()
      console.log('❌ Login failed:', loginResponse.status)
      console.log('📝 Error:', errorData)
    }
  } catch (error) {
    console.log('❌ Login request failed:', error.message)
  }
}

testLogin().catch(console.error)
