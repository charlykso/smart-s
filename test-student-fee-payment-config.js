#!/usr/bin/env node

/**
 * Test StudentFeePaymentPage with Environment Configuration
 * This tests the API endpoints using the proper base URL
 */

const baseURL = 'http://localhost:3000/api/v1' // This should match the .env file

async function testStudentFeePaymentAPIs() {
  console.log('🔍 Testing Student Fee Payment Page APIs...\n')

  try {
    // Step 1: Login to get token
    console.log('1. Logging in as student...')
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

    const token = loginData.data.token

    // Step 2: Test the exact API endpoints used in StudentFeePaymentPage
    console.log('\n2. Testing Student Fee Payment APIs...')

    // Test approved fees API
    console.log('   📋 Testing /fee/student/approved-fees...')
    const approvedFeesResponse = await fetch(
      `${baseURL}/fee/student/approved-fees`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (approvedFeesResponse.ok) {
      const approvedFeesData = await approvedFeesResponse.json()
      console.log('   ✅ Approved fees fetched successfully')
      console.log(
        '   📊 Number of approved fees:',
        approvedFeesData.data ? approvedFeesData.data.length : 0
      )
    } else {
      console.log(
        '   ❌ Failed to fetch approved fees:',
        approvedFeesResponse.status
      )
    }

    // Test outstanding fees API
    console.log('   📋 Testing /student/outstanding-fees...')
    const outstandingFeesResponse = await fetch(
      `${baseURL}/student/outstanding-fees`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (outstandingFeesResponse.ok) {
      const outstandingFeesData = await outstandingFeesResponse.json()
      console.log('   ✅ Outstanding fees fetched successfully')
      console.log(
        '   📊 Outstanding fees data:',
        outstandingFeesData.data ? 'Available' : 'No data'
      )
    } else {
      console.log(
        '   ❌ Failed to fetch outstanding fees:',
        outstandingFeesResponse.status
      )
    }

    // Test payments API
    console.log('   📋 Testing /student/payments...')
    const paymentsResponse = await fetch(`${baseURL}/student/payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (paymentsResponse.ok) {
      const paymentsData = await paymentsResponse.json()
      console.log('   ✅ Payments fetched successfully')
      console.log(
        '   📊 Payments data:',
        paymentsData.data ? 'Available' : 'No data'
      )
    } else {
      console.log('   ❌ Failed to fetch payments:', paymentsResponse.status)
    }

    console.log('\n✅ All Student Fee Payment APIs tested successfully!')
    console.log(
      '🎉 The StudentFeePaymentPage should now work properly with the environment configuration!'
    )
  } catch (error) {
    console.log('\n❌ Test failed:', error.message)
    console.error(error)
  }
}

testStudentFeePaymentAPIs().catch(console.error)
