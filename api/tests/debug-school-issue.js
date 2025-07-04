const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function debugSchoolIssue() {
  try {
    console.log('🔍 DEBUGGING SCHOOL ISSUE FOR FEE CREATION')
    console.log('='.repeat(50))
    console.log()

    // Login as Bursar
    const bursarLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bursar@smart-s.com',
      password: 'password123',
    })
    const bursarToken = bursarLogin.data.data.token
    console.log('✅ Bursar logged in')

    // Check schools accessible to Bursar
    console.log('\n1. Checking schools accessible to Bursar...')
    try {
      const schoolsResponse = await axios.get(`${BASE_URL}/School/all`, {
        headers: { Authorization: `Bearer ${bursarToken}` },
      })
      console.log('Schools found:', schoolsResponse.data.length)
      schoolsResponse.data.forEach((school, index) => {
        console.log(`   ${index + 1}. ${school.name} (ID: ${school._id})`)
      })
    } catch (error) {
      console.log('❌ School access failed:', error.response?.data?.message)
    }

    // Check terms
    console.log('\n2. Checking terms accessible to Bursar...')
    try {
      const termsResponse = await axios.get(`${BASE_URL}/Term/all`, {
        headers: { Authorization: `Bearer ${bursarToken}` },
      })
      console.log('Terms found:', termsResponse.data.length)
      termsResponse.data.forEach((term, index) => {
        console.log(
          `   ${index + 1}. ${term.name} (ID: ${term._id}) - Session: ${
            term.session?.name || 'Unknown'
          }`
        )
      })
    } catch (error) {
      console.log('❌ Term access failed:', error.response?.data?.message)
    }

    // Test fee creation with debug
    console.log('\n3. Testing fee creation with various school IDs...')

    // Try with hardcoded Smart School Academy ID
    const testSchoolIds = [
      '6856ca374de0e2d916dc329c', // Known Smart School Academy ID
      '000000000000000000000000', // Invalid ID to test error handling
    ]

    for (const schoolId of testSchoolIds) {
      console.log(`\n   Testing with school ID: ${schoolId}`)
      try {
        const testFee = {
          name: `Debug Fee ${Date.now()}`,
          decription: 'Debug fee for testing',
          amount: 1000,
          school_id: schoolId,
          term_id: '6861594efcc6cbbde9566141', // Known term ID
          type: 'Test',
          isActive: true,
          isInstallmentAllowed: false,
          no_ofInstallments: 1,
          isApproved: false,
        }

        const createResponse = await axios.post(
          `${BASE_URL}/fee/create`,
          testFee,
          {
            headers: { Authorization: `Bearer ${bursarToken}` },
          }
        )
        console.log(`   ✅ Success with ${schoolId}:`, createResponse.data.name)

        // Clean up - delete the test fee
        try {
          await axios.delete(`${BASE_URL}/fee/${createResponse.data._id}`, {
            headers: { Authorization: `Bearer ${bursarToken}` },
          })
          console.log(`   🗑️ Cleaned up test fee`)
        } catch (deleteError) {
          console.log(
            `   ⚠️ Could not delete test fee (may not have delete endpoint)`
          )
        }
      } catch (error) {
        console.log(
          `   ❌ Failed with ${schoolId}:`,
          error.response?.data?.message || error.message
        )
      }
    }

    // Check current user school assignment
    console.log('\n4. Checking Bursar user details...')
    try {
      // Get user details from token
      const userResponse = await axios.get(`${BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${bursarToken}` },
      })
      console.log('User school assignment:', userResponse.data.school)
    } catch (error) {
      console.log(
        '❌ Could not get user profile:',
        error.response?.data?.message
      )
    }
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  }
}

debugSchoolIssue().then(() => {
  console.log('\n🔍 Debug completed!')
})
