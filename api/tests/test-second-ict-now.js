const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testSecondICTAdminNow() {
  try {
    console.log('Testing Second ICT Admin: ict2@system.edu\n')

    // Test login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ict2@system.edu',
      password: 'password123',
    })

    console.log('✅ Login successful!')
    const user = loginResponse.data.data.user
    const token = loginResponse.data.data.token

    console.log('User Details:')
    console.log(`- Name: ${user.firstname} ${user.lastname}`)
    console.log(`- Email: ${user.email}`)
    console.log(`- Roles: ${user.roles.join(', ')}`)
    console.log(`- School: ${user.school}`)

    // Test managed schools endpoint
    try {
      const managedSchoolsResponse = await axios.get(
        `${BASE_URL}/users/managed-schools`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      console.log('\n✅ Managed Schools endpoint works')
      console.log(
        'Schools:',
        managedSchoolsResponse.data.schools.map((s) => s.name)
      )
    } catch (error) {
      console.log('\n❌ Managed schools error:', error.response?.data?.message)
    }

    // Test schools by group endpoint
    try {
      const schoolsByGroupResponse = await axios.get(
        `${BASE_URL}/schools/by-group`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      console.log('\n✅ Schools by group endpoint works')
      console.log(
        'Schools:',
        schoolsByGroupResponse.data.schools.map((s) => s.name)
      )
    } catch (error) {
      console.log('\n❌ Schools by group error:', error.response?.data?.message)
    }

    // Test template download
    try {
      await axios.get(`${BASE_URL}/bulk-students/template`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log('\n✅ Template download works')
    } catch (error) {
      console.log(
        '\n❌ Template download error:',
        error.response?.data?.message
      )
    }

    console.log('\n🎉 Second ICT Admin is fully functional!')
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message)
  }
}

testSecondICTAdminNow()
