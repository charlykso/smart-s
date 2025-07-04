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
      console.log(
        'Headers:',
        Object.fromEntries(feesResponse.headers.entries())
      )

      if (feesResponse.ok) {
        feesData = await feesResponse.json()
        console.log('✅ Successfully fetched fees')
        console.log('Response type:', typeof feesData)
        console.log('Number of fees:', feesData.length || 'Not an array')
        if (Array.isArray(feesData) && feesData.length > 0) {
          console.log('First fee:', JSON.stringify(feesData[0], null, 2))
        }
      } else {
        const errorText = await feesResponse.text()
        console.log('❌ Error fetching fees:')
        console.log('Status:', feesResponse.status)
        console.log('Response:', errorText)
      }
    } catch (error) {
      console.error('❌ Network error fetching fees:', error.message)
    }

    // Step 3: Test fee creation using an existing term_id from a fetched fee
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

    const newFeeData = {
      name: 'Frontend Test Fee',
      description: 'Test fee created via frontend API test',
      amount: 25000,
      type: 'Tuition',
      school_id: '6856ca374de0e2d916dc329c', // Smart School Academy
      term_id: validTermId,
      isActive: true,
      isApproved: false,
    }

    try {
      // First check if we can get terms - if not, use the one from existing fees
      console.log('Checking if Bursar can access terms...')
      const termsResponse = await fetch(`${BASE_URL}/Term/all`, {
        method: 'GET',
        headers: authHeaders,
      })

      if (termsResponse.ok) {
        const termsData = await termsResponse.json()
        if (Array.isArray(termsData) && termsData.length > 0) {
          // Find a term for Smart School Academy
          const schoolTerms = termsData.filter(
            (term) =>
              term.session?.school === '6856ca374de0e2d916dc329c' ||
              term.session?.school?._id === '6856ca374de0e2d916dc329c'
          )
          if (schoolTerms.length > 0) {
            validTermId = schoolTerms[0]._id
            console.log(
              'Using term from API:',
              schoolTerms[0].name,
              'ID:',
              validTermId
            )
          }
        }
      } else {
        console.log(
          '⚠️ Bursar cannot access terms directly, will use existing term_id'
        )
      }

      if (validTermId) {
        newFeeData.term_id = validTermId
      } else {
        // Remove term_id if we can't get a valid one
        delete newFeeData.term_id
        console.log('⚠️ Creating fee without term_id')
      }

      const createResponse = await fetch(`${BASE_URL}/fee/create`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newFeeData),
      })

      console.log('Create fee status:', createResponse.status)

      if (createResponse.ok) {
        const createData = await createResponse.json()
        console.log('✅ Successfully created fee')
        console.log('Created fee:', JSON.stringify(createData, null, 2))
      } else {
        const errorText = await createResponse.text()
        console.log('❌ Error creating fee:')
        console.log('Status:', createResponse.status)
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
        console.log(`\nTesting ${endpoint.name} (${endpoint.path})...`)
        const response = await fetch(`${BASE_URL}${endpoint.path}`, {
          method: 'GET',
          headers: authHeaders,
        })

        console.log('Status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ ${endpoint.name} - Success`)
          console.log(
            'Count:',
            Array.isArray(data) ? data.length : 'Not an array'
          )
        } else {
          const errorText = await response.text()
          console.log(`❌ ${endpoint.name} - Error:`, response.status)
          console.log('Response:', errorText)
        }
      } catch (error) {
        console.error(`❌ ${endpoint.name} - Network error:`, error.message)
      }
    }

    // Step 5: Check frontend constants compatibility
    console.log('\n5. Checking frontend API endpoint compatibility...')
    const frontendEndpoints = {
      'FEES.ALL': '/fee/all',
      'FEES.CREATE': '/fee/create',
      'FEES.APPROVED': '/fee/get-approved-fees',
      'FEES.UNAPPROVED': '/fee/get-unapproved-fees',
      'FEES.BY_TERM': '/fee/term',
      'FEES.APPROVE': '/fee/:fee_id/approve',
    }

    console.log('Frontend endpoints being used:')
    Object.entries(frontendEndpoints).forEach(([key, path]) => {
      console.log(`  ${key}: ${path}`)
    })
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Execute the test
testFrontendFeeAPIs()
  .then(() => {
    console.log('\n✅ Frontend Fee API Test completed!')
  })
  .catch((error) => {
    console.error('❌ Test execution failed:', error)
  })
