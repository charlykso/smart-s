const fetch = require('node-fetch')

// Test the student fees endpoint
async function testStudentFeesEndpoint() {
  try {
    // First, login as a student to get token
    console.log('🔐 Logging in as student...')
    const loginResponse = await fetch(
      'http://localhost:3000/api/v1/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'student@smartschoolacademy.com',
          password: 'student123',
        }),
      }
    )

    const loginData = await loginResponse.json()

    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message)
      return
    }

    console.log('✅ Login successful')
    console.log(
      '👤 User:',
      loginData.data.user.firstname,
      loginData.data.user.lastname
    )
    console.log('🏫 School:', loginData.data.user.school?.name || 'N/A')
    console.log('🎫 Token:', loginData.data.token.substring(0, 20) + '...')

    // Now test the student fees endpoint
    console.log('\n🔍 Testing student fees endpoint...')
    const feesResponse = await fetch(
      'http://localhost:3000/api/v1/fee/student/approved-fees',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${loginData.data.token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const feesData = await feesResponse.json()

    console.log('📊 Response Status:', feesResponse.status)
    console.log('📊 Response Data:', JSON.stringify(feesData, null, 2))

    if (feesResponse.status === 200) {
      console.log('✅ Student fees endpoint is working!')
      console.log('📋 Number of fees found:', feesData.length || 0)

      if (feesData.length > 0) {
        console.log('📝 First fee details:')
        const firstFee = feesData[0]
        console.log('  - Name:', firstFee.name)
        console.log('  - Type:', firstFee.type)
        console.log('  - Amount:', firstFee.amount)
        console.log('  - Term:', firstFee.term?.name || firstFee.term)
        console.log('  - School:', firstFee.school?.name || firstFee.school)
        console.log('  - Approved:', firstFee.isApproved)
      }
    } else {
      console.error('❌ Student fees endpoint failed')
    }
  } catch (error) {
    console.error('❌ Error testing student fees endpoint:', error.message)
  }
}

testStudentFeesEndpoint()
