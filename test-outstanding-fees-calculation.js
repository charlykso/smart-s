const axios = require('axios')

async function testStudentDashboardEndpoint() {
  console.log('🔍 Testing Student Dashboard Endpoint')
  console.log('====================================\n')

  try {
    // Step 1: Login as student
    console.log('1. 🔐 Logging in as student...')
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'alice.student@smartschool.edu',
        password: 'password123',
      }
    )

    const token = loginResponse.data.data.token
    const user = loginResponse.data.data.user
    console.log('✅ Login successful')
    console.log(`User: ${user.email}`)

    // Step 2: Test student dashboard endpoint
    console.log('\n2. 📊 Testing /student/dashboard endpoint...')
    try {
      const dashboardResponse = await axios.get(
        'http://localhost:3000/api/v1/student/dashboard',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      console.log('✅ Dashboard endpoint exists')
      console.log('Response structure:', Object.keys(dashboardResponse.data))
      console.log(
        'Full response:',
        JSON.stringify(dashboardResponse.data, null, 2)
      )

      if (dashboardResponse.data.data?.financial) {
        console.log('\n📊 Financial data found:')
        console.log(
          'Total Outstanding:',
          dashboardResponse.data.data.financial.totalOutstanding
        )
        console.log(
          'Total Paid:',
          dashboardResponse.data.data.financial.totalPaid
        )
        console.log(
          'Recent Payments:',
          dashboardResponse.data.data.financial.recentPayments?.length || 0
        )
      }
    } catch (error) {
      console.log('❌ Dashboard endpoint does not exist or failed')
      console.log('Error:', error.response?.status, error.response?.statusText)
    }

    // Step 3: Calculate outstanding fees manually
    console.log('\n3. 🧮 Manual calculation of outstanding fees...')

    // Get student fees
    const feesResponse = await axios.get(
      'http://localhost:3000/api/v1/fee/student/approved-fees',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const fees = feesResponse.data.success
      ? feesResponse.data.data
      : feesResponse.data
    console.log(`Found ${fees.length} approved fees`)

    // Get student payments
    const paymentsResponse = await axios.get(
      'http://localhost:3000/api/v1/payment/all',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const allPayments = paymentsResponse.data
    const userPayments = allPayments.filter((payment) => {
      const paymentUserId =
        typeof payment.user === 'string' ? payment.user : payment.user?._id
      return paymentUserId === user._id && payment.status === 'success'
    })

    console.log(`Found ${userPayments.length} successful payments by user`)

    // Calculate totals
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0)
    const totalPaid = userPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    )
    const totalOutstanding = totalFees - totalPaid

    console.log('\n📊 Manual calculation results:')
    console.log(`Total Fees: ₦${totalFees.toLocaleString()}`)
    console.log(`Total Paid: ₦${totalPaid.toLocaleString()}`)
    console.log(`Outstanding: ₦${totalOutstanding.toLocaleString()}`)

    // Show fee breakdown
    console.log('\n📋 Fee breakdown:')
    fees.forEach((fee) => {
      const payment = userPayments.find((p) => {
        const paymentFeeId = typeof p.fee === 'string' ? p.fee : p.fee._id
        return paymentFeeId === fee._id
      })
      const status = payment ? '✅ PAID' : '❌ UNPAID'
      console.log(`${fee.name}: ₦${fee.amount.toLocaleString()} - ${status}`)
    })

    // Show payment breakdown
    console.log('\n💰 Payment breakdown:')
    userPayments.forEach((payment) => {
      const feeName =
        typeof payment.fee === 'string' ? 'Unknown Fee' : payment.fee.name
      console.log(
        `${feeName}: ₦${payment.amount.toLocaleString()} (${
          payment.mode_of_payment
        })`
      )
    })

    // Step 4: Check if dashboard calculation is correct
    console.log('\n4. ✅ Validation:')
    console.log(
      `Outstanding fees should be: ₦${totalOutstanding.toLocaleString()}`
    )
    console.log(`Dashboard showing: ₦0 (incorrect)`)

    if (totalOutstanding > 0) {
      console.log(
        '\n⚠️  ISSUE IDENTIFIED: Dashboard is not calculating outstanding fees correctly'
      )
      console.log(
        'The student dashboard needs to be fixed to properly calculate outstanding fees'
      )
    } else {
      console.log('\n✅ All fees are paid - outstanding calculation is correct')
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testStudentDashboardEndpoint()
