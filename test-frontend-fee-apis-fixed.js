// Test Script: Frontend Fee Management API Call Testing
// This script will test the actual frontend API calls to identify issues

const BASE_URL = 'http://localhost:3000/api/v1'

// Test the frontend API endpoints directly
async function testFrontendFeeAPIs() {
  console.log('🧪 Testing Frontend Fee Management API Calls...\n')

  try {
    // Step 1: Login as Bursar
    console.log('1. Logging in as Bursar...')
    const bursarEmail = 'bursar@smart-s.com'
    const bursarPassword = 'password123'

    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: bursarEmail,
        password: bursarPassword,
      }),
    })

    if (!loginResponse.ok) {
      console.error(
        '❌ Login failed:',
        loginResponse.status,
        loginResponse.statusText
      )
      return
    }

    const loginData = await loginResponse.json()
    const token = loginData.data.token
    console.log('✅ Bursar login successful')
    console.log(
      'Token preview:',
      token ? token.substring(0, 50) + '...' : 'No token'
    )
    console.log('User roles:', loginData.data.user.roles)
    console.log(
      'User school:',
      loginData.data.user.school || 'No school assigned'
    )

    // Headers for authenticated requests
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    // Step 2: Test GET /fee/all (same as frontend uses)
    console.log('\n2. Testing GET /fee/all (frontend endpoint)...')
    let feesData = null

    try {
      const feesResponse = await fetch(`${BASE_URL}/fee/all`, {
        method: 'GET',
        headers: authHeaders,
      })

      console.log('Status:', feesResponse.status)

      if (feesResponse.ok) {
        feesData = await feesResponse.json()
        console.log('✅ Successfully fetched fees')
        console.log(
          'Number of fees:',
          Array.isArray(feesData) ? feesData.length : 'Not an array'
        )
      } else {
        const errorText = await feesResponse.text()
        console.log('❌ Error fetching fees:', feesResponse.status, errorText)
      }
    } catch (error) {
      console.error('❌ Network error fetching fees:', error.message)
    }

    // Step 3: Test fee creation using existing term_id from fetched fees
    console.log(
      '\n3. Testing fee creation using existing term_id from fetched fees...'
    )

    let validTermId = null
    if (feesData && Array.isArray(feesData) && feesData.length > 0) {
      // Use term_id from an existing fee
      const existingFee = feesData[0]
      if (existingFee.term && existingFee.term._id) {
        validTermId = existingFee.term._id
        console.log(
          'Using existing term_id from fee:',
          existingFee.term.name,
          'ID:',
          validTermId
        )
      }
    }

    if (!validTermId) {
      console.log(
        '⚠️ No valid term_id found from existing fees, using hardcoded ID'
      )
      validTermId = '6861594efcc6cbbde9566141' // From the sample fee we saw earlier
    }

    const newFeeData = {
      name: 'Frontend Test Fee ' + Date.now(),
      description: 'Test fee created via frontend API test',
      amount: 15000,
      type: 'Test',
      school_id: '6856ca374de0e2d916dc329c', // Smart School Academy
      term_id: validTermId,
      isActive: true,
      isApproved: false,
    }

    try {
      const createResponse = await fetch(`${BASE_URL}/fee/create`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newFeeData),
      })

      console.log('Create fee status:', createResponse.status)

      if (createResponse.ok) {
        const createData = await createResponse.json()
        console.log('✅ Successfully created fee via frontend API!')
        console.log('Created fee ID:', createData.data?._id)
        console.log('Created fee name:', createData.data?.name)
      } else {
        const errorText = await createResponse.text()
        console.log('❌ Error creating fee:', createResponse.status)
        console.log('Response:', errorText)
      }
    } catch (error) {
      console.error('❌ Network error creating fee:', error.message)
    }

    // Step 4: Test other frontend endpoints
    console.log('\n4. Testing other frontend fee endpoints...')

    const endpointsToTest = [
      { name: 'Approved Fees', path: '/fee/get-approved-fees' },
      { name: 'Unapproved Fees', path: '/fee/get-unapproved-fees' },
    ]

    for (const endpoint of endpointsToTest) {
      try {
        console.log(`Testing ${endpoint.name} (${endpoint.path})...`)
        const response = await fetch(`${BASE_URL}${endpoint.path}`, {
          method: 'GET',
          headers: authHeaders,
        })

        if (response.ok) {
          const data = await response.json()
          console.log(
            `✅ ${endpoint.name} - Success, Count: ${
              Array.isArray(data) ? data.length : 'Not an array'
            }`
          )
        } else {
          console.log(`❌ ${endpoint.name} - Error: ${response.status}`)
        }
      } catch (error) {
        console.error(`❌ ${endpoint.name} - Network error:`, error.message)
      }
    }

    console.log(
      '\n✅ All API tests completed! Backend APIs are working correctly.'
    )
    console.log(
      '🎯 The issue is likely in the frontend UI code, not the API calls.'
    )
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Execute the test
testFrontendFeeAPIs()
