const axios = require('axios')
require('dotenv').config()

const BASE_URL = 'http://localhost:3000/api/v1'
const ADMIN_EMAIL = 'admin@smart-s.com'
const ADMIN_PASSWORD = 'password123'

async function checkSessionsAndTerms() {
  console.log('📊 Checking Sessions and Terms for Smart School Academy...\n')

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...')
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })

    if (!adminLogin.data.success) {
      throw new Error('Admin login failed')
    }

    const adminToken = adminLogin.data.data.token
    console.log('✅ Admin login successful')

    // Step 2: Get the school ID for Smart School Academy
    console.log('\n2. Getting Smart School Academy details...')
    const schoolsResponse = await axios.get(`${BASE_URL}/admin/schools`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const smartSchool = schoolsResponse.data.schools.find(
      (school) => school.name === 'Smart School Academy'
    )

    if (!smartSchool) {
      throw new Error('Smart School Academy not found')
    }

    console.log(`✅ Found school: ${smartSchool.name} (ID: ${smartSchool._id})`)

    // Step 3: Get all Sessions
    console.log('\n3. Fetching All Sessions...')
    try {
      const sessionsResponse = await axios.get(`${BASE_URL}/Session/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      const allSessions =
        sessionsResponse.data.sessions || sessionsResponse.data.data || []
      console.log(`📅 Total Sessions in System: ${allSessions.length}`)

      // Filter sessions for Smart School Academy
      const schoolSessions = allSessions.filter(
        (session) =>
          session.school?._id === smartSchool._id ||
          session.schoolId === smartSchool._id ||
          session.school === smartSchool._id
      )

      console.log(
        `📅 Sessions for Smart School Academy: ${schoolSessions.length}`
      )

      if (schoolSessions.length > 0) {
        console.log('\nSession Details:')
        schoolSessions.forEach((session, index) => {
          console.log(
            `   ${index + 1}. ${session.name || session.sessionName} (${
              session.startYear
            }-${session.endYear})`
          )
          console.log(
            `      Status: ${session.isActive ? 'Active' : 'Inactive'}`
          )
          console.log(`      ID: ${session._id}`)
          if (session.school) {
            console.log(
              `      School: ${session.school.name || session.school}`
            )
          }
        })
      } else {
        console.log('\n   No sessions found for Smart School Academy')
        if (allSessions.length > 0) {
          console.log('\n   Available sessions in system:')
          allSessions.slice(0, 3).forEach((session, index) => {
            console.log(
              `   ${index + 1}. ${
                session.name || session.sessionName
              } - School: ${
                session.school?.name || session.school || 'Unknown'
              }`
            )
          })
        }
      }
    } catch (error) {
      console.log(
        '❌ Error fetching sessions:',
        error.response?.data?.message || error.message
      )
    }

    // Step 4: Get all Terms
    console.log('\n4. Fetching All Terms...')
    try {
      const termsResponse = await axios.get(`${BASE_URL}/Term/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      const allTerms = termsResponse.data.terms || termsResponse.data.data || []
      console.log(`📚 Total Terms in System: ${allTerms.length}`)

      // Filter terms for Smart School Academy (through sessions)
      const schoolTerms = allTerms.filter((term) => {
        if (term.session?.school?._id === smartSchool._id) return true
        if (term.session?.school === smartSchool._id) return true
        if (term.school?._id === smartSchool._id) return true
        if (term.school === smartSchool._id) return true
        return false
      })

      console.log(`� Terms for Smart School Academy: ${schoolTerms.length}`)

      if (schoolTerms.length > 0) {
        console.log('\nTerm Details:')
        schoolTerms.forEach((term, index) => {
          console.log(`   ${index + 1}. ${term.name || term.termName}`)
          console.log(`      Status: ${term.isActive ? 'Active' : 'Inactive'}`)
          console.log(`      ID: ${term._id}`)
          if (term.session) {
            console.log(
              `      Session: ${term.session.name || term.session.sessionName}`
            )
          }
        })
      } else {
        console.log('\n   No terms found for Smart School Academy')
        if (allTerms.length > 0) {
          console.log('\n   Available terms in system:')
          allTerms.slice(0, 3).forEach((term, index) => {
            const sessionInfo = term.session
              ? ` (Session: ${term.session.name || term.session.sessionName})`
              : ''
            console.log(
              `   ${index + 1}. ${term.name || term.termName}${sessionInfo}`
            )
          })
        }
      }
    } catch (error) {
      console.log(
        '❌ Error fetching terms:',
        error.response?.data?.message || error.message
      )
    }
  } catch (error) {
    console.error('❌ Query failed:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
  }
}

// Execute if run directly
if (require.main === module) {
  checkSessionsAndTerms().then(() => {
    console.log('\n✅ Sessions and Terms query completed!')
  })
}

module.exports = { checkSessionsAndTerms }
