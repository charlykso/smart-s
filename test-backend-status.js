#!/usr/bin/env node

/**
 * Quick API Test - Check Backend Status
 */

const baseURL = 'http://localhost:3000'

async function testBackendStatus() {
  console.log('🔍 Testing Backend Server Status...\n')

  try {
    // Test 1: Health check
    console.log('1. Testing server health...')
    const healthResponse = await fetch(`${baseURL}/health`)
    if (healthResponse.ok) {
      const health = await healthResponse.json()
      console.log('   ✅ Server is healthy:', health)
    } else {
      console.log('   ❌ Health check failed:', healthResponse.status)
    }
  } catch (error) {
    console.log('   ❌ Server connection failed:', error.message)
  }

  try {
    // Test 2: Login endpoint
    console.log('\n2. Testing login endpoint...')
    const loginResponse = await fetch(`${baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'alice.student@smartschool.edu',
        password: 'password123',
      }),
    })

    console.log('   Response status:', loginResponse.status)
    const loginText = await loginResponse.text()
    console.log('   Response body:', loginText)
  } catch (error) {
    console.log('   ❌ Login test failed:', error.message)
  }

  try {
    // Test 3: Basic API endpoint
    console.log('\n3. Testing basic API endpoint...')
    const apiResponse = await fetch(`${baseURL}/api/v1/Session/all`)
    console.log('   Session API status:', apiResponse.status)
    const apiText = await apiResponse.text()
    console.log('   Session API response:', apiText.substring(0, 200) + '...')
  } catch (error) {
    console.log('   ❌ API test failed:', error.message)
  }
}

testBackendStatus().catch(console.error)
