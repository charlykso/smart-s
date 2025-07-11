const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function verifySessionsAndTerms() {
  try {
    console.log(
      '🔍 Final Verification of Sessions and Terms for Smart School Academy\n'
    )

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

    // Step 2: Get Smart School Academy details
    console.log('\n2. Getting school details...')
    const schoolsResponse = await axios.get(`${BASE_URL}/School/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const smartSchool = schoolsResponse.data.find(
      (school) => school.name === 'Smart School Academy'
    )

    if (!smartSchool) {
      throw new Error('Smart School Academy not found')
    }

    console.log(`✅ Found school: ${smartSchool.name} (ID: ${smartSchool._id})`)

    // Step 3: Get all sessions
    console.log('\n3. Getting all sessions...')
    const sessionsResponse = await axios.get(`${BASE_URL}/Session/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const allSessions = sessionsResponse.data || []
    const smartSchoolSessions = allSessions.filter(
      (session) =>
        session.school?._id === smartSchool._id ||
        session.school === smartSchool._id
    )

    console.log(
      `✅ Total Sessions for Smart School Academy: ${smartSchoolSessions.length}`
    )

    smartSchoolSessions.forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.name}`)
      console.log(`      - ID: ${session._id}`)
      console.log(`      - Start: ${session.startDate}`)
      console.log(`      - End: ${session.endDate}`)
    })

    // Step 4: Get all terms
    console.log('\n4. Getting all terms...')
    const termsResponse = await axios.get(`${BASE_URL}/Term/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const allTerms = termsResponse.data || []

    console.log(`📋 Total Terms in System: ${allTerms.length}`)

    // Group terms by session
    const termsBySession = {}
    allTerms.forEach((term) => {
      const sessionId = term.session?._id || term.session
      if (!termsBySession[sessionId]) {
        termsBySession[sessionId] = []
      }
      termsBySession[sessionId].push(term)
    })

    console.log('\n📚 Terms by Session:')
    smartSchoolSessions.forEach((session) => {
      const sessionTerms = termsBySession[session._id] || []
      console.log(`\n   ${session.name} (${sessionTerms.length} terms):`)
      sessionTerms.forEach((term, index) => {
        console.log(`      ${index + 1}. ${term.name}`)
        console.log(`         - Start: ${term.startDate}`)
        console.log(`         - End: ${term.endDate}`)
        console.log(`         - ID: ${term._id}`)
      })

      if (sessionTerms.length === 0) {
        console.log('      (No terms found)')
      }
    })

    // Step 5: Summary
    const totalSchoolTerms = smartSchoolSessions.reduce((total, session) => {
      return total + (termsBySession[session._id]?.length || 0)
    }, 0)

    console.log('\n📊 SUMMARY:')
    console.log(`   School: Smart School Academy`)
    console.log(`   Sessions: ${smartSchoolSessions.length}`)
    console.log(`   Terms: ${totalSchoolTerms}`)
    console.log(`   Expected: 6 terms (3 per session)`)
    console.log(
      `   Status: ${totalSchoolTerms >= 6 ? '✅ Complete' : '⚠️ Incomplete'}`
    )
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
  }
}

// Execute if run directly
if (require.main === module) {
  verifySessionsAndTerms().then(() => {
    console.log('\n🔍 Verification completed!')
  })
}

module.exports = { verifySessionsAndTerms }
