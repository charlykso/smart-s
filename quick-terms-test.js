// Quick test to check admin login and create working terms
const BASE_URL = 'http://localhost:3000/api/v1'

async function quickTermsTest() {
  try {
    console.log('🔧 Quick Terms Test...\n')

    // Try Bursar login instead
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

    // Get sessions
    const sessionsResponse = await fetch(`${BASE_URL}/Session/all`, {
      headers: authHeaders,
    })

    const sessionsData = await sessionsResponse.json()
    const sessions = sessionsData || []
    console.log(
      'Sessions found:',
      Array.isArray(sessions) ? sessions.length : 'Not an array'
    )
    console.log('Sessions data type:', typeof sessionsData)
    console.log('Sessions data:', sessionsData)

    if (Array.isArray(sessions)) {
      sessions.forEach((s) => console.log(`  - ${s.name} (${s._id})`))
    }

    // Get terms
    const termsResponse = await fetch(`${BASE_URL}/Term/all`, {
      headers: authHeaders,
    })

    const termsData = await termsResponse.json()
    const terms = termsData || []
    console.log(
      '\nTerms found:',
      Array.isArray(terms) ? terms.length : 'Not an array'
    )
    console.log('Terms data type:', typeof termsData)

    if (Array.isArray(terms)) {
      terms.forEach((t) => {
        const sessionName = t.session?.name || 'Unknown Session'
        console.log(`  - ${t.name} (${t._id}) - Session: ${sessionName}`)
      })
    }

    // Test creating a simple fee with an existing term
    if (Array.isArray(terms) && terms.length > 0) {
      console.log('\n🧪 Testing fee creation with existing term...')
      const testFee = {
        name: 'Quick Test Fee',
        description: 'Testing fee creation',
        amount: 5000,
        type: 'Test',
        school_id: '6856ca374de0e2d916dc329c',
        term_id: terms[0]._id,
        isActive: true,
        isApproved: false,
      }

      const createResponse = await fetch(`${BASE_URL}/fee/create`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(testFee),
      })

      if (createResponse.ok) {
        const createData = await createResponse.json()
        console.log('✅ Fee created successfully!')
        console.log('Fee ID:', createData.data._id)
      } else {
        const errorText = await createResponse.text()
        console.log('❌ Fee creation failed:', createResponse.status)
        console.log('Error:', errorText)
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

quickTermsTest()
