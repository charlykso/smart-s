const axios = require('axios')

const API_BASE_URL = 'http://localhost:3000/api/v1'

async function testStudentFeeEndpoint() {
  try {
    console.log('🔍 Testing student fee endpoint...')

    // Step 1: Login as student
    console.log('📝 Logging in as student...')
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'alice.student@smartschool.edu',
      password: 'password123',
    })

    console.log('✅ Login successful')
    console.log('Response structure:', Object.keys(loginResponse.data))

    // Handle different response structures
    const user = loginResponse.data.data.user
    const token = loginResponse.data.data.token

    console.log('User:', user.firstname, user.lastname)
    console.log('Role:', user.roles[0])
    console.log('School:', user.school?.name || 'N/A')
    console.log('Token:', token ? 'Present' : 'Missing')

    // Step 2: Test the student approved fees endpoint
    console.log('\n🎯 Testing /fee/student/approved-fees endpoint...')
    const feesResponse = await axios.get(
      `${API_BASE_URL}/fee/student/approved-fees`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('✅ Student fees endpoint successful')
    console.log('Status:', feesResponse.status)
    console.log('Response structure:', Object.keys(feesResponse.data))
    console.log('Full response:', JSON.stringify(feesResponse.data, null, 2))

    // Handle different response structures
    const fees = feesResponse.data.data || feesResponse.data
    console.log(
      'Number of fees:',
      Array.isArray(fees) ? fees.length : 'Not an array'
    )

    if (Array.isArray(fees) && fees.length > 0) {
      console.log('\n📋 Sample fees:')
      fees.slice(0, 3).forEach((fee, index) => {
        console.log(
          `${index + 1}. ${fee.name} - ₦${fee.amount.toLocaleString()}`
        )
        console.log(`   Type: ${fee.type}`)
        console.log(`   Description: ${fee.decription}`)
        console.log(`   Approved: ${fee.isApproved}`)
        console.log(
          `   Term: ${typeof fee.term === 'object' ? fee.term.name : fee.term}`
        )
        console.log('')
      })
    } else {
      console.log('No fees found for this student')
    }

    // Step 3: Test the old endpoint to compare
    console.log('\n🔄 Testing old admin endpoint for comparison...')
    try {
      const oldEndpointResponse = await axios.get(
        `${API_BASE_URL}/fee/all/school/${user.school._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      console.log(
        '⚠️  Old endpoint still accessible:',
        oldEndpointResponse.status
      )
    } catch (oldError) {
      console.log(
        '✅ Old endpoint correctly blocked:',
        oldError.response?.status,
        oldError.response?.statusText
      )
    }

    return fees
  } catch (error) {
    console.error('❌ Error testing student fee endpoint:')
    console.error('Status:', error.response?.status)
    console.error('Message:', error.response?.data?.message || error.message)
    console.error('Data:', error.response?.data)
    throw error
  }
}

// Run the test
testStudentFeeEndpoint()
  .then((fees) => {
    console.log('\n🎉 Test completed successfully!')
    console.log(`Found ${fees.length} fees for the student`)
  })
  .catch((error) => {
    console.error('\n💥 Test failed')
    process.exit(1)
  })
