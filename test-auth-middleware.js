#!/usr/bin/env node

/**
 * Test Updated Auth Middleware
 */

const baseURL = 'http://localhost:3000/api/v1'

async function testAuthMiddleware() {
  console.log('🔍 Testing Updated Auth Middleware...\n')

  try {
    // Step 1: Login
    console.log('1. Testing login...')
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

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.log('   ❌ Login failed:', loginResponse.status, errorText)
      return
    }

    const loginData = await loginResponse.json()
    console.log('   ✅ Login successful!')
    console.log(
      '   👤 User:',
      loginData.data.user.firstname,
      loginData.data.user.lastname
    )

    const token = loginData.data.token

    // Step 2: Test protected endpoints
    console.log('\n2. Testing protected endpoints...')

    const endpoints = [
      { name: 'Sessions', path: '/Session/all' },
      { name: 'Terms', path: '/Term/all' },
      { name: 'Approved Fees', path: '/fee/student/approved-fees' },
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseURL}${endpoint.path}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        console.log(
          `   ${endpoint.name}: ${response.status} ${response.statusText}`
        )

        if (response.ok) {
          const data = await response.json()
          console.log(`   ✅ ${endpoint.name} - Success`)
        } else {
          const errorText = await response.text()
          console.log(
            `   ❌ ${endpoint.name} - Error: ${errorText.substring(0, 100)}...`
          )
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.name} - Exception: ${error.message}`)
      }
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message)
  }
}

testAuthMiddleware().catch(console.error)
