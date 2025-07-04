// Test the exact endpoints the frontend uses for school and term data
const BASE_URL = 'http://localhost:3000/api/v1'

async function testFrontendSchoolAndTermEndpoints() {
  console.log('🔍 Testing Frontend School & Term Endpoints...\n')

  try {
    // Login as Bursar
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bursar@smart-s.com',
        password: 'password123',
      }),
    })

    const loginData = await loginResponse.json()
    const token = loginData.data.token
    console.log('✅ Bursar login successful')

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    // Test the exact endpoints from the frontend constants
    const endpointsToTest = [
      { name: 'Schools (GET /school/all)', path: '/school/all' },
      { name: 'Terms (GET /Term/all)', path: '/Term/all' },
      { name: 'Sessions (GET /Session/all)', path: '/Session/all' },
    ]

    for (const endpoint of endpointsToTest) {
      console.log(`\n🧪 Testing ${endpoint.name}...`)

      try {
        const response = await fetch(`${BASE_URL}${endpoint.path}`, {
          method: 'GET',
          headers: authHeaders,
        })

        console.log(`Status: ${response.status}`)

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Success`)

          if (Array.isArray(data)) {
            console.log(`   Count: ${data.length}`)
            if (data.length > 0) {
              console.log(`   First item:`, data[0].name || data[0]._id)
            }
          } else if (data && typeof data === 'object') {
            console.log(`   Response type: object`)
            if (data.success !== undefined) {
              console.log(`   Success: ${data.success}`)
              console.log(`   Message: ${data.message || 'No message'}`)
            }
          }
        } else {
          const errorText = await response.text()
          console.log(`❌ Error: ${response.status}`)
          console.log(`   Response: ${errorText}`)
        }
      } catch (error) {
        console.error(`❌ Network error:`, error.message)
      }
    }

    // Special test: Check if Bursar can only see their own school
    console.log(`\n🎯 Analysis: Can Bursar access school and term data?`)

    const schoolResponse = await fetch(`${BASE_URL}/school/all`, {
      headers: authHeaders,
    })

    if (schoolResponse.ok) {
      const schools = await schoolResponse.json()
      if (Array.isArray(schools) && schools.length > 0) {
        console.log(`✅ Bursar CAN access schools (${schools.length} schools)`)
        console.log(`   Available schools for dropdown:`)
        schools.forEach((school) => {
          console.log(`   - ${school.name} (${school._id})`)
        })
      } else {
        console.log(`⚠️ Bursar can access /school/all but gets empty array`)
      }
    } else {
      console.log(
        `❌ Bursar CANNOT access schools - this breaks the fee creation form!`
      )
    }

    const termResponse = await fetch(`${BASE_URL}/Term/all`, {
      headers: authHeaders,
    })

    if (termResponse.ok) {
      const terms = await termResponse.json()
      if (Array.isArray(terms) && terms.length > 0) {
        console.log(`✅ Bursar CAN access terms (${terms.length} terms)`)
        console.log(`   Available terms for dropdown:`)
        terms.forEach((term) => {
          console.log(`   - ${term.name} (${term._id})`)
        })
      } else {
        console.log(`⚠️ Bursar can access /Term/all but gets empty array`)
      }
    } else {
      console.log(
        `❌ Bursar CANNOT access terms - this breaks the fee creation form!`
      )
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testFrontendSchoolAndTermEndpoints()
