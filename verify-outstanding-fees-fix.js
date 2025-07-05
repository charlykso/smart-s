const axios = require('axios')

async function verifyOutstandingFeeFix() {
  console.log('🔍 Verifying Outstanding Fees Fix')
  console.log('=================================\n')

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
    console.log('✅ Login successful')

    // Step 2: Get dashboard data
    console.log('\n2. 📊 Getting dashboard data...')
    const dashboardResponse = await axios.get(
      'http://localhost:3000/api/v1/student/dashboard',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const financial = dashboardResponse.data.data.financial

    console.log('✅ Dashboard data retrieved successfully')
    console.log('\n💰 Financial Summary:')
    console.log(
      `Total Outstanding: ₦${financial.totalOutstanding.toLocaleString()}`
    )
    console.log(`Total Paid: ₦${financial.totalPaid.toLocaleString()}`)
    console.log(`Outstanding Fees Count: ${financial.outstandingFees.length}`)
    console.log(`Recent Payments Count: ${financial.recentPayments.length}`)

    // Step 3: Verify the fix
    console.log('\n3. ✅ Verification Results:')

    if (financial.totalOutstanding === 25000) {
      console.log('✅ Outstanding fees calculation: FIXED')
      console.log('   - Correctly showing ₦25,000 instead of ₦0')
    } else {
      console.log('❌ Outstanding fees calculation: STILL BROKEN')
      console.log(
        `   - Expected: ₦25,000, Got: ₦${financial.totalOutstanding.toLocaleString()}`
      )
    }

    if (financial.totalPaid === 14000) {
      console.log('✅ Total paid calculation: CORRECT')
      console.log('   - Correctly showing ₦14,000')
    } else {
      console.log('❌ Total paid calculation: INCORRECT')
      console.log(
        `   - Expected: ₦14,000, Got: ₦${financial.totalPaid.toLocaleString()}`
      )
    }

    if (financial.outstandingFees.length === 5) {
      console.log('✅ Outstanding fees list: CORRECT')
      console.log('   - Correctly showing 5 unpaid fees')
    } else {
      console.log('❌ Outstanding fees list: INCORRECT')
      console.log(
        `   - Expected: 5 fees, Got: ${financial.outstandingFees.length} fees`
      )
    }

    // Step 4: Show outstanding fees breakdown
    console.log('\n4. 📋 Outstanding Fees Breakdown:')
    financial.outstandingFees.forEach((fee, index) => {
      console.log(
        `${index + 1}. ${fee.name}: ₦${fee.amount.toLocaleString()} (${
          fee.type
        })`
      )
    })

    // Step 5: Show recent payments
    console.log('\n5. 💳 Recent Payments:')
    financial.recentPayments.forEach((payment, index) => {
      console.log(
        `${index + 1}. ${
          payment.fee.name
        }: ₦${payment.amount.toLocaleString()} (${payment.mode})`
      )
    })

    console.log('\n🎉 OUTSTANDING FEES FIX VERIFICATION COMPLETE!')
    console.log('============================================')

    const allCorrect =
      financial.totalOutstanding === 25000 &&
      financial.totalPaid === 14000 &&
      financial.outstandingFees.length === 5

    if (allCorrect) {
      console.log('✅ STATUS: ALL CALCULATIONS ARE NOW CORRECT')
      console.log(
        '✅ The student dashboard will now show proper outstanding fees'
      )
      console.log('✅ Students can see exactly which fees they need to pay')
    } else {
      console.log('❌ STATUS: SOME ISSUES REMAIN')
      console.log('❌ Additional fixes may be needed')
    }
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    if (error.response?.data) {
      console.error('Response:', error.response.data)
    }
  }
}

verifyOutstandingFeeFix()
