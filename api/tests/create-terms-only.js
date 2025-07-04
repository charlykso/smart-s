const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createTermsForSessions() {
  try {
    console.log('🎯 Creating Terms for Existing Sessions...\n')

    // Step 1: Login as admin
    console.log('1. Logging in as admin...')
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@smart-s.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123'

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword,
    })
    const adminToken = loginResponse.data.data.token
    console.log('✅ Admin login successful')
    console.log(
      'Token preview:',
      adminToken ? adminToken.substring(0, 50) + '...' : 'No token'
    )

    // Step 2: Get all sessions for Smart School Academy
    console.log('\n2. Getting existing sessions...')
    const sessionsResponse = await axios.get(`${BASE_URL}/Session/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const allSessions = sessionsResponse.data || []
    const smartSchoolSessions = allSessions.filter(
      (session) =>
        session.school?._id === '6856ca374de0e2d916dc329c' ||
        session.school === '6856ca374de0e2d916dc329c'
    )

    console.log(
      `✅ Found ${smartSchoolSessions.length} sessions for Smart School Academy`
    )
    smartSchoolSessions.forEach((session) => {
      console.log(`   - ${session.name} (ID: ${session._id})`)
    })

    // Step 3: Create terms for each session
    for (const session of smartSchoolSessions) {
      console.log(`\n3. Creating terms for "${session.name}"...`)

      let terms = []

      if (session.name === '2023/2024 Academic Session') {
        terms = [
          {
            name: 'First Term',
            session: session._id,
            startDate: '2023-09-01',
            endDate: '2023-12-15',
          },
          {
            name: 'Second Term',
            session: session._id,
            startDate: '2024-01-08',
            endDate: '2024-04-05',
          },
          {
            name: 'Third Term',
            session: session._id,
            startDate: '2024-04-22',
            endDate: '2024-07-31',
          },
        ]
      } else if (session.name === '2024/2025 Academic Session') {
        terms = [
          {
            name: 'First Term',
            session: session._id,
            startDate: '2024-09-01',
            endDate: '2024-12-15',
          },
          {
            name: 'Second Term',
            session: session._id,
            startDate: '2025-01-08',
            endDate: '2025-04-05',
          },
          {
            name: 'Third Term',
            session: session._id,
            startDate: '2025-04-22',
            endDate: '2025-07-31',
          },
        ]
      }

      for (const termData of terms) {
        try {
          const termResponse = await axios.post(
            `${BASE_URL}/Term/create`,
            termData,
            {
              headers: { Authorization: `Bearer ${adminToken}` },
            }
          )

          console.log(`✅ Created term: ${termData.name}`)
        } catch (error) {
          if (error.response?.data?.message?.includes('already exists')) {
            console.log(`ℹ️ Term already exists: ${termData.name}`)
          } else {
            console.log(
              `❌ Error creating term ${termData.name}:`,
              error.response?.data?.message || error.message
            )
          }
        }
      }
    }

    // Step 4: Verify final count
    console.log('\n4. Final verification...')

    const termsResponse = await axios.get(`${BASE_URL}/Term/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const allTerms = termsResponse.data || []
    const schoolTerms = allTerms.filter((term) => {
      return smartSchoolSessions.some(
        (session) =>
          session._id === term.session?._id || session._id === term.session
      )
    })

    console.log(
      `✅ Total Terms created for Smart School Academy: ${schoolTerms.length}`
    )

    if (schoolTerms.length > 0) {
      console.log('\nCreated terms:')
      schoolTerms.forEach((term) => {
        const sessionName =
          smartSchoolSessions.find(
            (s) => s._id === (term.session?._id || term.session)
          )?.name || 'Unknown Session'
        console.log(`   - ${term.name} (${sessionName})`)
      })
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
  }
}

// Execute if run directly
if (require.main === module) {
  createTermsForSessions().then(() => {
    console.log('\n✅ Terms creation completed!')
  })
}

module.exports = { createTermsForSessions }
