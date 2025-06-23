const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testSecondICTAdmin() {
  try {
    console.log('Testing Second ICT Admin...\n')

    // Try to login with second ICT Admin credentials
    console.log('Attempting to login as second ICT Admin...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ict@bluefield.edu',
      password: 'password123',
    })

    console.log('✅ Second ICT Admin login successful!')
    const user = loginResponse.data.data.user
    const token = loginResponse.data.data.token

    console.log('User Details:')
    console.log(`- Name: ${user.firstname} ${user.lastname}`)
    console.log(`- Email: ${user.email}`)
    console.log(`- Roles: ${user.roles.join(', ')}`)
    console.log(`- Registration No: ${user.regNo}`)
    console.log(`- School ID: ${user.school}`)

    // Test managed schools endpoint
    console.log('\nTesting managed schools endpoint...')
    try {
      const managedSchoolsResponse = await axios.get(
        `${BASE_URL}/users/managed-schools`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log('✅ Managed schools accessed successfully')
      console.log(
        'Schools:',
        managedSchoolsResponse.data.schools.map((s) => s.name)
      )
    } catch (error) {
      console.log('❌ Managed schools error:', error.response?.data?.message)
    }

    // Test schools by group endpoint
    console.log('\nTesting schools by group endpoint...')
    try {
      const schoolsByGroupResponse = await axios.get(
        `${BASE_URL}/schools/by-group`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log('✅ Schools by group accessed successfully')
      console.log(
        'Schools:',
        schoolsByGroupResponse.data.schools.map((s) => s.name)
      )
    } catch (error) {
      console.log('❌ Schools by group error:', error.response?.data?.message)
    }

    console.log('\n✅ Second ICT Admin test completed!')
  } catch (error) {
    console.error('\n❌ Second ICT Admin test failed:')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error(
        'Message:',
        error.response.data?.message || error.response.data
      )

      if (error.response.status === 401) {
        console.log(
          '\n💡 This likely means the second ICT Admin does not exist yet.'
        )
        console.log(
          'Please run the create-second-ict-admin-setup.js script first.'
        )
      }
    } else {
      console.error('Error:', error.message)
    }
  }
}

testSecondICTAdmin()
