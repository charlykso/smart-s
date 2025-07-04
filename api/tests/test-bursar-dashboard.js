const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testBursarFeeManagement() {
  try {
    console.log('🧪 TESTING BURSAR FEE MANAGEMENT FUNCTIONALITY')
    console.log('='.repeat(55))
    console.log()

    // Step 1: Login as Bursar
    console.log('1. Logging in as Bursar...')
    const bursarLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bursar@smart-s.com',
      password: 'password123',
    })

    const bursarToken = bursarLogin.data.data.token
    console.log('✅ Bursar login successful')
    console.log('Token (first 50 chars):', bursarToken.substring(0, 50) + '...')
    console.log()

    // Step 2: Test fee endpoints one by one
    console.log('2. Testing fee endpoints...')

    // Test getting all fees
    console.log('\n   Testing GET /fee/all...')
    try {
      const feesResponse = await axios.get(`${BASE_URL}/fee/all`, {
        headers: {
          Authorization: `Bearer ${bursarToken}`,
          'Content-Type': 'application/json',
        },
      })
      console.log(
        '   ✅ GET /fee/all successful - Found',
        feesResponse.data.length || 0,
        'fees'
      )
    } catch (error) {
      console.log(
        '   ❌ GET /fee/all failed:',
        error.response?.status,
        error.response?.data?.message || error.message
      )
    }

    // Test getting approved fees
    console.log('\n   Testing GET /fee/get-approved-fees...')
    try {
      const approvedFeesResponse = await axios.get(
        `${BASE_URL}/fee/get-approved-fees`,
        {
          headers: {
            Authorization: `Bearer ${bursarToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      console.log(
        '   ✅ GET /fee/get-approved-fees successful - Found',
        approvedFeesResponse.data.length || 0,
        'approved fees'
      )
    } catch (error) {
      console.log(
        '   ❌ GET /fee/get-approved-fees failed:',
        error.response?.status,
        error.response?.data?.message || error.message
      )
    }

    // Test getting unapproved fees
    console.log('\n   Testing GET /fee/get-unapproved-fees...')
    try {
      const unapprovedFeesResponse = await axios.get(
        `${BASE_URL}/fee/get-unapproved-fees`,
        {
          headers: {
            Authorization: `Bearer ${bursarToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      console.log(
        '   ✅ GET /fee/get-unapproved-fees successful - Found',
        unapprovedFeesResponse.data.length || 0,
        'unapproved fees'
      )
    } catch (error) {
      console.log(
        '   ❌ GET /fee/get-unapproved-fees failed:',
        error.response?.status,
        error.response?.data?.message || error.message
      )
    }

    // Step 3: Test creating a fee
    console.log('\n3. Testing fee creation...')
    const testFee = {
      name: 'Test Tuition Fee',
      amount: 50000,
      description: 'Test fee created by Bursar',
      school: '6856ca374de0e2d916dc329c', // Smart School Academy ID
      session: '68615268cf548180bd920bbc', // 2023/2024 session ID
      term: '6861561cc9c0fa825e1de973', // First term ID
      type: 'Tuition',
      dueDate: '2024-01-15',
    }

    try {
      const createFeeResponse = await axios.post(
        `${BASE_URL}/fee/create`,
        testFee,
        {
          headers: {
            Authorization: `Bearer ${bursarToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      console.log('✅ Fee creation successful!')
      console.log('Created fee ID:', createFeeResponse.data._id)
    } catch (error) {
      console.log(
        '❌ Fee creation failed:',
        error.response?.status,
        error.response?.data?.message || error.message
      )
      if (error.response?.data) {
        console.log(
          'Full error response:',
          JSON.stringify(error.response.data, null, 2)
        )
      }
    }

    // Step 4: Test token validity
    console.log('\n4. Testing token validity...')
    try {
      const tokenTestResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${bursarToken}`,
          'Content-Type': 'application/json',
        },
      })
      console.log('✅ Token is valid - User:', tokenTestResponse.data.email)
    } catch (error) {
      console.log(
        '❌ Token validation failed:',
        error.response?.status,
        error.response?.data?.message || error.message
      )
    }

    // Step 5: Test school access
    console.log('\n5. Testing school access...')
    try {
      const schoolResponse = await axios.get(`${BASE_URL}/School/all`, {
        headers: {
          Authorization: `Bearer ${bursarToken}`,
          'Content-Type': 'application/json',
        },
      })
      console.log(
        '✅ School access successful - Found',
        schoolResponse.data.length || 0,
        'schools'
      )
    } catch (error) {
      console.log(
        '❌ School access failed:',
        error.response?.status,
        error.response?.data?.message || error.message
      )
    }

    console.log('\n' + '='.repeat(55))
    console.log('🔍 TROUBLESHOOTING SUMMARY')
    console.log('='.repeat(55))
    console.log('If you see 401 errors, the issue is likely:')
    console.log('1. Frontend token not being sent correctly')
    console.log('2. Token expired - check frontend token refresh logic')
    console.log('3. CORS issues between frontend and backend')
    console.log('4. Middleware authentication issues')
    console.log()
    console.log('If you see "Resource not found" errors:')
    console.log('1. Check if the frontend is calling correct API endpoints')
    console.log('2. Verify route definitions in backend')
    console.log('3. Check if data exists in database')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
  }
}

// Execute if run directly
if (require.main === module) {
  testBursarFeeManagement().then(() => {
    console.log('\n🧪 Bursar fee management test completed!')
  })
}

module.exports = { testBursarFeeManagement }
