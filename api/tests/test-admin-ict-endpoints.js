const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testAdminICTEndpoints() {
  try {
    console.log('Testing Admin access to ICT endpoints...\n')

    // Step 1: Login as Admin
    console.log('Step 1: Logging in as Admin...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    const token = loginResponse.data.data.token
    console.log('Admin login successful!')

    // Step 2: Test schools/by-group endpoint
    console.log('\nStep 2: Testing /schools/by-group endpoint...')
    try {
      const schoolsResponse = await axios.get(`${BASE_URL}/schools/by-group`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('✅ Schools by group retrieved successfully!')
      console.log('Schools count:', schoolsResponse.data.schools?.length || 0)

      if (
        schoolsResponse.data.schools &&
        schoolsResponse.data.schools.length > 0
      ) {
        console.log('First school:', {
          id: schoolsResponse.data.schools[0]._id,
          name: schoolsResponse.data.schools[0].name,
          groupSchool: schoolsResponse.data.schools[0].groupSchool?.name,
        })
      }
    } catch (error) {
      console.log(
        '❌ Schools by group failed:',
        error.response?.data || error.message
      )
    }

    // Step 3: Test users/managed-schools endpoint
    console.log('\nStep 3: Testing /users/managed-schools endpoint...')
    try {
      const usersResponse = await axios.get(
        `${BASE_URL}/users/managed-schools`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('✅ Managed users retrieved successfully!')
      console.log('Users count:', usersResponse.data.users?.length || 0)

      if (usersResponse.data.users && usersResponse.data.users.length > 0) {
        console.log('First user:', {
          id: usersResponse.data.users[0]._id,
          name: `${usersResponse.data.users[0].firstname} ${usersResponse.data.users[0].lastname}`,
          email: usersResponse.data.users[0].email,
          roles: usersResponse.data.users[0].roles,
          school: usersResponse.data.users[0].school?.name,
        })
      }
    } catch (error) {
      console.log(
        '❌ Managed users failed:',
        error.response?.data || error.message
      )
    }

    // Step 4: Test template download
    console.log('\nStep 4: Testing template download...')
    try {
      const templateResponse = await axios.get(
        `${BASE_URL}/bulk-students/template`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'arraybuffer',
        }
      )

      console.log('✅ Template download successful!')
      console.log('File size:', templateResponse.data.length, 'bytes')
    } catch (error) {
      console.log(
        '❌ Template download failed:',
        error.response?.status,
        error.response?.data || error.message
      )
    }

    console.log('\n🎉 All tests completed!')
  } catch (error) {
    console.error('\n❌ Test failed:')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error(
        'Message:',
        error.response.data?.message || error.response.data
      )
    } else {
      console.error('Error:', error.message)
    }
  }
}

testAdminICTEndpoints()
