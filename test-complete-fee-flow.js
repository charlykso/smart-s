#!/usr/bin/env node

/**
 * Complete Student Fee Payment Test
 * This tests the full flow from login to fee data retrieval
 */

const baseURL = 'http://localhost:3001/api/v1'

async function testCompleteFlow() {
  console.log('🔍 Testing Complete Student Fee Payment Flow...\n')

  try {
    // Step 1: Login
    console.log('1. Testing Student Login...')
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
      throw new Error(`Login failed: ${loginResponse.status}`)
    }

    const loginData = await loginResponse.json()
    console.log('   ✅ Login successful!')
    console.log(
      '   👤 User:',
      loginData.data.user.firstname,
      loginData.data.user.lastname
    )
    console.log('   🎫 Token received:', !!loginData.data.token)

    const token = loginData.data.token
    const userId = loginData.data.user._id

    // Step 2: Test Fee-related APIs
    console.log('\n2. Testing Fee APIs...')

    // Test student fees
    console.log('   📋 Fetching student fees...')
    const feesResponse = await fetch(`${baseURL}/students/${userId}/fees`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (feesResponse.ok) {
      const feesData = await feesResponse.json()
      console.log('   ✅ Student fees fetched successfully')
      console.log(
        '   📊 Number of fees:',
        feesData.data ? feesData.data.length : 0
      )
    } else {
      console.log('   ❌ Failed to fetch student fees:', feesResponse.status)
      const errorText = await feesResponse.text()
      console.log('   📝 Error:', errorText)
    }

    // Test fee types
    console.log('   📋 Fetching fee types...')
    const feeTypesResponse = await fetch(`${baseURL}/fee-types`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (feeTypesResponse.ok) {
      const feeTypesData = await feeTypesResponse.json()
      console.log('   ✅ Fee types fetched successfully')
      console.log(
        '   📊 Number of fee types:',
        feeTypesData.data ? feeTypesData.data.length : 0
      )
    } else {
      console.log('   ❌ Failed to fetch fee types:', feeTypesResponse.status)
      const errorText = await feeTypesResponse.text()
      console.log('   📝 Error:', errorText)
    }

    // Test payment history
    console.log('   📋 Fetching payment history...')
    const paymentsResponse = await fetch(
      `${baseURL}/payments/student/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (paymentsResponse.ok) {
      const paymentsData = await paymentsResponse.json()
      console.log('   ✅ Payment history fetched successfully')
      console.log(
        '   📊 Number of payments:',
        paymentsData.data ? paymentsData.data.length : 0
      )
    } else {
      console.log(
        '   ❌ Failed to fetch payment history:',
        paymentsResponse.status
      )
      const errorText = await paymentsResponse.text()
      console.log('   📝 Error:', errorText)
    }

    // Step 3: Test token validation
    console.log('\n3. Testing Token Validation...')
    const profileResponse = await fetch(`${baseURL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (profileResponse.ok) {
      const profileData = await profileResponse.json()
      console.log('   ✅ Token is valid, profile fetched successfully')
      console.log(
        '   👤 Profile user:',
        profileData.data.firstname,
        profileData.data.lastname
      )
    } else {
      console.log('   ❌ Token validation failed:', profileResponse.status)
      const errorText = await profileResponse.text()
      console.log('   📝 Error:', errorText)
    }

    console.log('\n✅ Complete flow test completed successfully!')
  } catch (error) {
    console.log('\n❌ Test failed:', error.message)
    console.error(error)
  }
}

testCompleteFlow().catch(console.error)
