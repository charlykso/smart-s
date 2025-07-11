const axios = require('axios')
require('dotenv').config()

const BASE_URL = 'http://localhost:3000/api/v1'
const ADMIN_EMAIL = 'admin@smart-s.com'
const ADMIN_PASSWORD = 'password123'

async function createBasicSessionsAndTerms() {
  console.log(
    '🏫 Creating Basic Sessions and Terms for Smart School Academy...\n'
  )

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...')
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })

    const adminToken = adminLogin.data.data.token
    console.log('✅ Admin login successful')

    // Step 2: Get the school ID
    console.log('\n2. Getting Smart School Academy details...')
    const schoolsResponse = await axios.get(`${BASE_URL}/admin/schools`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const smartSchool = schoolsResponse.data.schools.find(
      (school) => school.name === 'Smart School Academy'
    )

    console.log(`✅ Found school: ${smartSchool.name} (ID: ${smartSchool._id})`)

    // Step 3: Create 2023/2024 Academic Session
    console.log('\n3. Creating 2023/2024 Academic Session...')
    try {
      const sessionData = {
        school_id: smartSchool._id,
        name: '2023/2024 Academic Session',
        startDate: '2023-09-01',
        endDate: '2024-07-31',
      }

      const sessionResponse = await axios.post(
        `${BASE_URL}/Session/create`,
        sessionData,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      )

      console.log(
        'Session response data:',
        JSON.stringify(sessionResponse.data, null, 2)
      )
      const createdSession = sessionResponse.data // The entire response is the session object
      console.log('✅ Created session:', createdSession?.name || 'Success')

      // Step 4: Create Terms for this session
      const terms = [
        {
          name: 'First Term',
          session: createdSession._id,
          startDate: '2023-09-01',
          endDate: '2023-12-15',
        },
        {
          name: 'Second Term',
          session: createdSession._id,
          startDate: '2024-01-08',
          endDate: '2024-04-05',
        },
        {
          name: 'Third Term',
          session: createdSession._id,
          startDate: '2024-04-22',
          endDate: '2024-07-31',
        },
      ]

      console.log('\n4. Creating Terms for 2023/2024 session...')
      for (const termData of terms) {
        try {
          const termResponse = await axios.post(
            `${BASE_URL}/Term/create`,
            termData,
            {
              headers: { Authorization: `Bearer ${adminToken}` },
            }
          )

          const createdTerm = termResponse.data.term || termResponse.data.data
          console.log('✅ Created term:', createdTerm?.name || termData.name)
        } catch (error) {
          console.log(
            `❌ Error creating term ${termData.name}:`,
            error.response?.data?.message || error.message
          )
        }
      }
    } catch (error) {
      console.log(
        '❌ Error creating session:',
        error.response?.data?.message || error.message
      )
    }

    // Step 5: Create 2024/2025 Academic Session
    console.log('\n5. Creating 2024/2025 Academic Session...')
    try {
      const sessionData = {
        school_id: smartSchool._id,
        name: '2024/2025 Academic Session',
        startDate: '2024-09-01',
        endDate: '2025-07-31',
      }

      const sessionResponse = await axios.post(
        `${BASE_URL}/Session/create`,
        sessionData,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      )

      console.log(
        'Session response data:',
        JSON.stringify(sessionResponse.data, null, 2)
      )
      const createdSession = sessionResponse.data // The entire response is the session object
      console.log('✅ Created session:', createdSession?.name || 'Success')

      // Create Terms for this session
      const terms = [
        {
          name: 'First Term',
          session: createdSession._id,
          startDate: '2024-09-01',
          endDate: '2024-12-15',
        },
        {
          name: 'Second Term',
          session: createdSession._id,
          startDate: '2025-01-08',
          endDate: '2025-04-05',
        },
        {
          name: 'Third Term',
          session: createdSession._id,
          startDate: '2025-04-22',
          endDate: '2025-07-31',
        },
      ]

      console.log('\n6. Creating Terms for 2024/2025 session...')
      for (const termData of terms) {
        try {
          const termResponse = await axios.post(
            `${BASE_URL}/Term/create`,
            termData,
            {
              headers: { Authorization: `Bearer ${adminToken}` },
            }
          )

          const createdTerm = termResponse.data.term || termResponse.data.data
          console.log('✅ Created term:', createdTerm?.name || termData.name)
        } catch (error) {
          console.log(
            `❌ Error creating term ${termData.name}:`,
            error.response?.data?.message || error.message
          )
        }
      }
    } catch (error) {
      console.log(
        '❌ Error creating session:',
        error.response?.data?.message || error.message
      )
    }

    // Step 7: Verify creation by re-checking
    console.log('\n7. Verifying created sessions and terms...')

    // Check sessions
    const sessionsResponse = await axios.get(`${BASE_URL}/Session/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const allSessions = sessionsResponse.data || []
    console.log('All sessions found:', allSessions.length)
    console.log(
      'Sessions:',
      allSessions.map((s) => ({ name: s.name, school: s.school }))
    )

    const schoolSessions = allSessions.filter(
      (session) =>
        session.school?._id === smartSchool._id ||
        session.school === smartSchool._id
    )

    console.log(
      `✅ Total Sessions for Smart School Academy: ${schoolSessions.length}`
    )
    if (schoolSessions.length > 0) {
      console.log(
        'School sessions:',
        schoolSessions.map((s) => s.name)
      )
    }

    // Check terms
    const termsResponse = await axios.get(`${BASE_URL}/Term/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const allTerms = termsResponse.data || []
    console.log('All terms found:', allTerms.length)

    const schoolTerms = allTerms.filter((term) => {
      if (term.session?.school?._id === smartSchool._id) return true
      if (term.session?.school === smartSchool._id) return true
      return false
    })

    console.log(
      `✅ Total Terms for Smart School Academy: ${schoolTerms.length}`
    )
    if (schoolTerms.length > 0) {
      console.log(
        'School terms:',
        schoolTerms.map((t) => ({ name: t.name, session: t.session?.name }))
      )
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
  createBasicSessionsAndTerms().then(() => {
    console.log('\n✅ Sessions and Terms setup completed!')
  })
}

module.exports = { createBasicSessionsAndTerms }
