const axios = require('axios')

async function testStudentPaymentFiltering() {
  try {
    console.log('🔍 Testing Student Payment Filtering Logic...')

    // Step 1: Login as student
    console.log('📝 Logging in as student (Alice)...')
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'alice.student@smartschool.edu',
        password: 'password123',
      }
    )

    if (!loginResponse.data.success) {
      throw new Error('Login failed')
    }

    const token = loginResponse.data.data.token
    const user = loginResponse.data.data.user
    console.log('✅ Login successful')
    console.log('User ID:', user._id)
    console.log('User email:', user.email)

    // Step 2: Get all payments
    console.log('\n🔍 Fetching all payments...')
    const paymentsResponse = await axios.get(
      'http://localhost:3000/api/v1/payment/all',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const allPayments = paymentsResponse.data
    console.log('Total payments in system:', allPayments.length)

    // Step 3: Filter payments for current user
    const userPayments = allPayments.filter((payment) => {
      const paymentUserId =
        typeof payment.user === 'string' ? payment.user : payment.user?._id
      return paymentUserId === user._id
    })

    console.log('\n📊 Payment filtering results:')
    console.log('All payments:', allPayments.length)
    console.log('User payments:', userPayments.length)

    if (userPayments.length > 0) {
      console.log("\n💰 User's payments:")
      userPayments.forEach((payment, index) => {
        console.log(`${index + 1}. Fee: ${payment.fee.name}`)
        console.log(`   Amount: ₦${payment.amount.toLocaleString()}`)
        console.log(`   Status: ${payment.status}`)
        console.log(`   Method: ${payment.mode_of_payment}`)
        console.log(
          `   Date: ${new Date(payment.createdAt).toLocaleDateString()}`
        )
        console.log(`   Transaction ID: ${payment.trx_ref}`)
        console.log('')
      })
    } else {
      console.log('No payments found for this user')
    }

    console.log('✅ Payment filtering test completed!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
    }
  }
}

testStudentPaymentFiltering()
