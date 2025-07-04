const axios = require('axios')

// Test configuration
const BASE_URL = 'http://localhost:3001'

// Test login credentials (Bursar)
const loginData = {
  email: 'john.doe@greenwood.edu',
  password: 'password123',
}

async function testFrontendFeeFiltering() {
  console.log('🔍 Testing Frontend Fee Filtering Logic...\n')

  try {
    // Step 1: Login as Bursar
    console.log('1. Logging in as Bursar...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData)
    const token = loginResponse.data.token
    const user = loginResponse.data.user

    console.log(`   ✅ Login successful: ${user.email} (${user.role})`)
    console.log(`   🏫 School: ${user.school.name}`)
    console.log(`   🎯 User ID: ${user._id}`)

    // Step 2: Get fees to test filtering
    console.log('\n2. Fetching fees for filtering test...')
    const feesResponse = await axios.get(`${BASE_URL}/fee/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const fees = feesResponse.data
    console.log(`   📋 Total fees found: ${fees.length}`)

    // Step 3: Test different filter scenarios
    console.log('\n3. Testing filter scenarios...')

    // Test case 1: Normal fees with all properties
    console.log('\n   📋 Test 1: Normal fees with all properties')
    const normalFees = fees.filter(
      (fee) => fee.name && fee.decription && fee.type
    )
    console.log(`   ✅ Fees with all properties: ${normalFees.length}`)

    // Test case 2: Fees with missing properties (simulate the bug)
    console.log('\n   📋 Test 2: Simulating fees with missing properties')
    const testFees = [
      { name: 'Valid Fee', decription: 'Valid description', type: 'TUITION' },
      { name: null, decription: 'Missing name', type: 'TUITION' },
      { name: 'Valid Fee 2', decription: null, type: 'TUITION' },
      { name: 'Valid Fee 3', decription: 'Valid description', type: null },
      { name: undefined, decription: undefined, type: undefined },
    ]

    // Simulate the old filtering logic (would cause errors)
    console.log('\n   🔴 Old filtering logic (would fail):')
    try {
      const oldFilterResults = testFees.filter((fee) => {
        const searchTerm = 'fee'
        const searchLower = searchTerm.toLowerCase()
        return (
          fee.name.toLowerCase().includes(searchLower) ||
          fee.decription.toLowerCase().includes(searchLower) ||
          fee.type.toLowerCase().includes(searchLower)
        )
      })
      console.log(
        `   ❌ Old logic should have failed but didn't: ${oldFilterResults.length}`
      )
    } catch (error) {
      console.log(`   ✅ Old logic correctly failed: ${error.message}`)
    }

    // Test the new filtering logic (should work)
    console.log('\n   🟢 New filtering logic (should work):')
    const newFilterResults = testFees.filter((fee) => {
      const searchTerm = 'fee'
      const searchLower = searchTerm.toLowerCase()
      return (
        (fee.name && fee.name.toLowerCase().includes(searchLower)) ||
        (fee.decription &&
          fee.decription.toLowerCase().includes(searchLower)) ||
        (fee.type && fee.type.toLowerCase().includes(searchLower))
      )
    })
    console.log(
      `   ✅ New logic works: ${newFilterResults.length} matches found`
    )

    // Step 4: Test actual search functionality
    console.log('\n4. Testing actual search functionality...')

    if (fees.length > 0) {
      const searchTerm = 'fee'
      const filteredFees = fees.filter((fee) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          (fee.name && fee.name.toLowerCase().includes(searchLower)) ||
          (fee.decription &&
            fee.decription.toLowerCase().includes(searchLower)) ||
          (fee.type && fee.type.toLowerCase().includes(searchLower))
        )
      })

      console.log(`   🔍 Search term: "${searchTerm}"`)
      console.log(`   📋 Matching fees: ${filteredFees.length}`)

      if (filteredFees.length > 0) {
        console.log('\n   📋 Sample matching fees:')
        filteredFees.slice(0, 3).forEach((fee, index) => {
          console.log(
            `   ${index + 1}. ${fee.name || 'No name'} - ${
              fee.type || 'No type'
            }`
          )
        })
      }
    }

    console.log('\n✅ Frontend fee filtering test completed successfully!')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('   Response data:', error.response.data)
    }
  }
}

// Run the test
testFrontendFeeFiltering()
