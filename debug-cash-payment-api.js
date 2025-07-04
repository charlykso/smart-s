const axios = require('axios')

async function debugCashPaymentAPI() {
  console.log('🔍 Debugging Cash Payment API Call...\n')

  try {
    // First, let's get a valid token by logging in
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'bursar@smartschool.com',
        password: 'bursar123',
      }
    )

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message)
      return
    }

    const token = loginResponse.data.data.token
    console.log('✅ Login successful, token obtained')

    // Get a student to test with
    const studentsResponse = await axios.get(
      'http://localhost:5000/api/school-access/users/Student',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (
      !studentsResponse.data.success ||
      studentsResponse.data.data.length === 0
    ) {
      console.error('❌ No students found')
      return
    }

    const student = studentsResponse.data.data[0]
    console.log('✅ Found student:', student.firstName, student.lastName)

    // Get fees for the student's school
    const feesResponse = await axios.get(
      `http://localhost:5000/api/fees/school/${student.school}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!feesResponse.data.success || feesResponse.data.data.length === 0) {
      console.error('❌ No fees found for student school')
      return
    }

    const fee = feesResponse.data.data[0]
    console.log('✅ Found fee:', fee.name, '-', fee.amount)

    // Now try the cash payment
    console.log('\n🧪 Testing Cash Payment API...')
    console.log('Payment data:')
    console.log({
      user_id: student._id,
      fee_id: fee._id,
    })

    const paymentResponse = await axios.post(
      'http://localhost:5000/api/payment/pay-with-cash',
      {
        user_id: student._id,
        fee_id: fee._id,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    console.log('\n📊 Payment Response:')
    console.log('Status:', paymentResponse.status)
    console.log('Success:', paymentResponse.data.success)
    console.log('Message:', paymentResponse.data.message)

    if (paymentResponse.data.success) {
      console.log('✅ Cash payment API call successful!')
      console.log('Payment data:', paymentResponse.data.data)
    } else {
      console.log(
        '❌ Cash payment API call failed:',
        paymentResponse.data.message
      )
    }
  } catch (error) {
    console.error('\n❌ Error during cash payment test:')

    if (error.response) {
      console.log('Status:', error.response.status)
      console.log('Data:', error.response.data)
      console.log('Headers:', error.response.headers)
    } else if (error.request) {
      console.log('No response received:', error.request)
    } else {
      console.log('Error:', error.message)
    }

    console.log('Full error:', error)
  }
}

debugCashPaymentAPI()
