const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

async function testStudentEndpoints() {
  console.log('🔍 Testing Student API Endpoints...\n')

  try {
    // First, let's login as a student to get a token
    console.log('1. Logging in as student...')
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teststudent@test.com',
      password: 'password123',
    })

    if (!loginResponse.data.success) {
      console.log('❌ Student login failed:', loginResponse.data.message)
      return
    }

    const token = loginResponse.data.data.token
    const user = loginResponse.data.data.user
    console.log('✅ Student login successful')
    console.log(
      '   Login response:',
      JSON.stringify(loginResponse.data, null, 2)
    )
    console.log('   User ID:', user?._id || user?.id)
    console.log('   School ID:', user?.school?._id || user?.school)
    console.log('   Roles:', user?.roles)

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    // Test student dashboard
    console.log('\n2. Testing student dashboard...')
    try {
      const dashboardResponse = await axios.get(
        `${API_BASE}/student/dashboard`,
        { headers }
      )
      console.log('✅ Student dashboard:', dashboardResponse.status)
    } catch (error) {
      console.log(
        '❌ Student dashboard failed:',
        error.response?.status,
        error.response?.data?.message
      )
    }

    // Test student approved fees
    console.log('\n3. Testing student approved fees...')
    try {
      const feesResponse = await axios.get(
        `${API_BASE}/fee/student/approved-fees`,
        { headers }
      )
      console.log('✅ Student approved fees:', feesResponse.status)
      console.log(
        '   Number of fees:',
        feesResponse.data?.data?.length || feesResponse.data?.length || 0
      )
    } catch (error) {
      console.log(
        '❌ Student approved fees failed:',
        error.response?.status,
        error.response?.data?.message
      )
    }

    // Test student payments
    console.log('\n4. Testing student payments...')
    try {
      const paymentsResponse = await axios.get(
        `${API_BASE}/payment/student/my-payments`,
        { headers }
      )
      console.log('✅ Student payments:', paymentsResponse.status)
      console.log(
        '   Number of payments:',
        paymentsResponse.data?.data?.length ||
          paymentsResponse.data?.length ||
          0
      )
    } catch (error) {
      console.log(
        '❌ Student payments failed:',
        error.response?.status,
        error.response?.data?.message
      )
    }

    // Test payment methods for school
    const schoolId = user?.school?._id || user?.school
    if (schoolId) {
      console.log('\n5. Testing payment methods for school...')
      try {
        const methodsResponse = await axios.get(
          `${API_BASE}/payment/available-methods/${schoolId}`,
          { headers }
        )
        console.log('✅ Payment methods:', methodsResponse.status)
        console.log(
          '   Available methods:',
          methodsResponse.data?.data?.length || 0
        )
      } catch (error) {
        console.log(
          '❌ Payment methods failed:',
          error.response?.status,
          error.response?.data?.message
        )

        // Check if payment profile exists
        console.log('\n   Checking payment profiles...')
        try {
          const profilesResponse = await axios.get(
            `${API_BASE}/paymentProfile/all`,
            { headers }
          )
          console.log(
            '   Total payment profiles:',
            profilesResponse.data?.length || 0
          )

          const schoolProfiles =
            profilesResponse.data?.filter((p) => p.school === schoolId) || []
          console.log('   Profiles for this school:', schoolProfiles.length)
        } catch (profileError) {
          console.log(
            '   ❌ Could not check payment profiles:',
            profileError.response?.status
          )
        }
      }
    }

    console.log('\n✅ Test completed!')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testStudentEndpoints()
