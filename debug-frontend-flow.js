const axios = require('axios')

async function testFrontendFlow() {
  try {
    console.log('🔍 Testing Frontend Flow...')

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

    console.log('Login response structure:', Object.keys(loginResponse.data))
    console.log('Login response data:', loginResponse.data)

    const token = loginResponse.data.data.token
    console.log('✅ Login successful')
    console.log('Token:', token ? 'Present' : 'Missing')

    // Step 2: Call the student fees endpoint exactly like the frontend would
    console.log('🔍 Calling student fees endpoint...')
    const feesResponse = await axios.get(
      'http://localhost:3000/api/v1/fee/student/approved-fees',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('✅ API Response received')
    console.log('Response status:', feesResponse.status)
    console.log('Response data structure:', Object.keys(feesResponse.data))

    // Step 3: Process the response exactly like the FeeService would
    const apiResponse = feesResponse.data
    console.log('📊 Processing response...')
    console.log('API Response success:', apiResponse.success)
    console.log('API Response message:', apiResponse.message)
    console.log('API Response data type:', typeof apiResponse.data)
    console.log(
      'API Response data length:',
      apiResponse.data ? apiResponse.data.length : 'N/A'
    )

    // Step 4: Extract fees like the FeeService would
    let fees = []
    if (apiResponse.success && apiResponse.data) {
      fees = apiResponse.data
    } else {
      fees = apiResponse || []
    }

    console.log('📋 Final fees array:')
    console.log('Type:', typeof fees)
    console.log('Length:', fees.length)
    console.log('Is Array:', Array.isArray(fees))

    if (fees.length > 0) {
      console.log('📝 First fee sample:')
      console.log('  Name:', fees[0].name)
      console.log('  Type:', fees[0].type)
      console.log('  Amount:', fees[0].amount)
      console.log('  Term:', fees[0].term?.name)
      console.log('  Session:', fees[0].term?.session?.name)
    }

    console.log('✅ Test completed successfully!')
  } catch (error) {
    console.error('❌ Error in frontend flow test:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

testFrontendFlow()
