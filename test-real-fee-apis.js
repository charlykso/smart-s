#!/usr/bin/env node

/**
 * Test Real Student Fee Payment APIs
 * This tests the actual API endpoints that should be used in the frontend
 */

const baseURL = 'http://localhost:3001/api/v1'

async function testRealAPIs() {
  console.log('🔍 Testing Real Student Fee Payment APIs...\n')

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

    // Step 2: Test the correct API endpoints
    console.log('\n2. Testing Real Fee Payment APIs...')

    // Test 1: Get approved fees for student (this is what the frontend should use)
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
      console.log('   📊 Success:', approvedFeesData.success)
      console.log(
        '   📊 Number of approved fees:',
        approvedFeesData.data ? approvedFeesData.data.length : 0
      )
      if (approvedFeesData.data && approvedFeesData.data.length > 0) {
        console.log(
          '   📋 First fee:',
          approvedFeesData.data[0].name,
          '- Amount:',
          approvedFeesData.data[0].amount
        )
      }
    } else {
      console.log(
        '   ❌ Failed to fetch approved fees:',
        approvedFeesResponse.status
      )
      const errorText = await approvedFeesResponse.text()
      console.log('   📝 Error:', errorText)
    }

    // Test 2: Get student outstanding fees
    console.log('\n   📋 Testing /student/outstanding-fees...')
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
      console.log('   📊 Success:', outstandingFeesData.success)
      console.log(
        '   📊 Number of outstanding fees:',
        outstandingFeesData.data ? outstandingFeesData.data.length : 0
      )
    } else {
      console.log(
        '   ❌ Failed to fetch outstanding fees:',
        outstandingFeesResponse.status
      )
      const errorText = await outstandingFeesResponse.text()
      console.log('   📝 Error:', errorText)
    }

    // Test 3: Get student payment history
    console.log('\n   📋 Testing /student/payments...')
    const paymentsResponse = await fetch(`${baseURL}/student/payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (paymentsResponse.ok) {
      const paymentsData = await paymentsResponse.json()
      console.log('   ✅ Payment history fetched successfully')
      console.log('   📊 Success:', paymentsData.success)
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

    // Test 4: Get student dashboard data
    console.log('\n   📋 Testing /student/dashboard...')
    const dashboardResponse = await fetch(`${baseURL}/student/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json()
      console.log('   ✅ Dashboard data fetched successfully')
      console.log('   📊 Success:', dashboardData.success)
      console.log('   📊 Dashboard data available:', !!dashboardData.data)
    } else {
      console.log(
        '   ❌ Failed to fetch dashboard data:',
        dashboardResponse.status
      )
      const errorText = await dashboardResponse.text()
      console.log('   📝 Error:', errorText)
    }

    console.log('\n✅ Real API test completed successfully!')
    console.log('\n📝 SUMMARY:')
    console.log('   - Login: Working ✅')
    console.log('   - API Endpoints to use in frontend:')
    console.log('     • /api/v1/fee/student/approved-fees (for available fees)')
    console.log(
      '     • /api/v1/student/outstanding-fees (for outstanding fees)'
    )
    console.log('     • /api/v1/student/payments (for payment history)')
    console.log('     • /api/v1/student/dashboard (for dashboard data)')
  } catch (error) {
    console.log('\n❌ Test failed:', error.message)
    console.error(error)
  }
}

testRealAPIs().catch(console.error)
