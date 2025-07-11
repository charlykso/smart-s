const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createMissingTerms() {
  try {
    console.log('🎯 Creating Missing Terms for 2024/2025 Session...\n')

    // Step 1: Login as admin
    console.log('1. Logging in as admin...')
    const adminEmail = 'admin@smart-s.com'
    const adminPassword = 'password123'

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword,
    })
    const adminToken = loginResponse.data.data.token
    console.log('✅ Admin login successful')

    // Step 2: Get the 2024/2025 session
    console.log('\n2. Finding 2024/2025 session...')
    const sessionsResponse = await axios.get(`${BASE_URL}/Session/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const session2024 = sessionsResponse.data.find(
      (session) => session.name === '2024/2025 Academic Session'
    )

    if (!session2024) {
      throw new Error('2024/2025 Academic Session not found')
    }

    console.log(
      `✅ Found session: ${session2024.name} (ID: ${session2024._id})`
    )

    // Step 3: Create terms for 2024/2025
    console.log('\n3. Creating terms for 2024/2025 session...')

    const terms = [
      {
        name: 'First Term',
        session: session2024._id,
        startDate: '2024-09-01',
        endDate: '2024-12-15',
      },
      {
        name: 'Second Term',
        session: session2024._id,
        startDate: '2025-01-08',
        endDate: '2025-04-05',
      },
      {
        name: 'Third Term',
        session: session2024._id,
        startDate: '2025-04-22',
        endDate: '2025-07-31',
      },
    ]

    for (const termData of terms) {
      try {
        console.log(`Creating: ${termData.name}...`)
        console.log(`Session ID: ${termData.session}`)
        console.log(`Payload:`, JSON.stringify(termData, null, 2))

        const termResponse = await axios.post(
          `${BASE_URL}/Term/create`,
          termData,
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          }
        )

        console.log(`✅ Created term: ${termData.name}`)
        console.log(`Response:`, termResponse.data)
      } catch (error) {
        console.log(`❌ Error creating term ${termData.name}:`)
        console.log(`Status: ${error.response?.status}`)
        console.log(
          `Message: ${error.response?.data?.message || error.message}`
        )
        console.log(`Full response:`, error.response?.data)
      }
    }

    // Step 4: Verify creation
    console.log('\n4. Verifying creation...')
    const verifyResponse = await axios.get(`${BASE_URL}/Term/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const allTerms = verifyResponse.data || []
    const session2024Terms = allTerms.filter(
      (term) =>
        term.session?._id === session2024._id ||
        term.session === session2024._id
    )

    console.log(`✅ Terms for 2024/2025 session: ${session2024Terms.length}`)
    session2024Terms.forEach((term) => {
      console.log(`   - ${term.name}`)
    })
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
  }
}

// Execute if run directly
if (require.main === module) {
  createMissingTerms().then(() => {
    console.log('\n✅ Missing terms creation completed!')
  })
}

module.exports = { createMissingTerms }
