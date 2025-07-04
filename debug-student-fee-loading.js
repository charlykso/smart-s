#!/usr/bin/env node

/**
 * Debug Student Fee Payment Loading Issue
 * This script tests the authentication and API endpoints
 */

const baseURL = 'http://localhost:3001/api/v1'

console.log('🔍 Debugging Student Fee Payment Loading Issue...\n')

async function runTests() {
  // Test 1: Health Check
  console.log('1. Testing Backend Health...')
  try {
    const healthResponse = await fetch(`${baseURL}/../health`)
    if (healthResponse.ok) {
      const health = await healthResponse.json()
      console.log('   ✅ Backend is healthy:', health)
    } else {
      console.log('   ❌ Backend health check failed:', healthResponse.status)
    }
  } catch (error) {
    console.log('   ❌ Backend connection failed:', error.message)
  }

  // Test 2: Student Login
  console.log('\n2. Testing Student Login...')
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
      console.log('   ✅ Student login successful')
      console.log('   📝 User:', loginData.user.name)
      console.log('   🎫 Token available:', !!loginData.accessToken)

      const token = loginData.accessToken

      // Test 3: Fee APIs with valid token
      console.log('\n3. Testing Fee APIs with authenticated token...')

      const feeAPIs = [
        '/fee/student/approved-fees',
        '/student/outstanding-fees',
        '/student/payments',
      ]

      for (const api of feeAPIs) {
        try {
          const apiResponse = await fetch(`${baseURL}${api}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (apiResponse.ok) {
            const data = await apiResponse.json()
            console.log(
              `   ✅ ${api}: ${data.success ? 'Success' : 'Failed'} - ${
                data.data?.length || 0
              } items`
            )
          } else {
            console.log(`   ❌ ${api}: HTTP ${apiResponse.status}`)
          }
        } catch (error) {
          console.log(`   ❌ ${api}: ${error.message}`)
        }
      }
    } else {
      const errorData = await loginResponse.text()
      console.log('   ❌ Student login failed:', loginResponse.status)
      console.log('   📝 Error:', errorData)
    }
  } catch (error) {
    console.log('   ❌ Login request failed:', error.message)
  }

  console.log('\n🏁 Debug test completed!')
}

// Run the tests
runTests().catch(console.error)
