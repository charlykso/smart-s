const axios = require('axios')

async function testStudentPayments() {
  try {
    console.log('🔍 Testing Student Payment History endpoint...')

    // Step 1: Login as student
    console.log('📝 Logging in as student...')
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
    console.log('✅ Login successful')

    // Step 2: Call the student payments endpoint
    console.log('🔍 Calling /payment/all endpoint...')
    const paymentsResponse = await axios.get(
      'http://localhost:3000/api/v1/payment/all',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('✅ Payment endpoint response received')
    console.log('Response status:', paymentsResponse.status)
    console.log('Response data structure:', Object.keys(paymentsResponse.data))
    console.log(
      'Full response:',
      JSON.stringify(paymentsResponse.data, null, 2)
    )

    // Step 3: Process the response
    const apiResponse = paymentsResponse.data
    console.log('📊 Processing response...')
    console.log('API Response success:', apiResponse.success)
    console.log('API Response message:', apiResponse.message)
    console.log('API Response data type:', typeof apiResponse.data)
    console.log(
      'API Response data length:',
      apiResponse.data ? apiResponse.data.length : 'N/A'
    )

    if (apiResponse.data && apiResponse.data.length > 0) {
      console.log('📝 First payment sample:')
      console.log('  ID:', apiResponse.data[0]._id)
      console.log('  Amount:', apiResponse.data[0].amount)
      console.log('  Status:', apiResponse.data[0].status)
      console.log('  Method:', apiResponse.data[0].mode_of_payment)
      console.log('  Date:', apiResponse.data[0].createdAt)
    }

    console.log('✅ Test completed successfully!')
  } catch (error) {
    console.error('❌ Error in student payments test:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

testStudentPayments()
