const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testAuthFlow() {
  try {
    console.log('Testing authentication flow...\n') // Step 1: Login as Admin first to test basic auth
    console.log('Step 1: Attempting login with Admin user...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    console.log('Login successful!')
    console.log('User:', {
      id: loginResponse.data.data.user._id,
      email: loginResponse.data.data.user.email,
      roles: loginResponse.data.data.user.roles,
      school: loginResponse.data.data.user.school,
    })

    const token = loginResponse.data.data.token
    console.log('Token received:', token ? 'Yes' : 'No')
    console.log('Token length:', token ? token.length : 0)

    // Step 2: Test getting user info
    console.log('\nStep 2: Testing /users/me endpoint...')
    const userResponse = await axios.get(`${BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('User info retrieved successfully:', {
      id: userResponse.data.user._id,
      email: userResponse.data.user.email,
      roles: userResponse.data.user.roles,
    })

    // Step 3: Test schools endpoint
    console.log('\nStep 3: Testing /schools/by-group endpoint...')
    const schoolsResponse = await axios.get(`${BASE_URL}/schools/by-group`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('Schools retrieved:', schoolsResponse.data.schools?.length || 0)
    if (
      schoolsResponse.data.schools &&
      schoolsResponse.data.schools.length > 0
    ) {
      console.log('First school:', {
        id: schoolsResponse.data.schools[0]._id,
        name: schoolsResponse.data.schools[0].name,
      })
    }

    // Step 4: Test users endpoint
    console.log('\nStep 4: Testing /users/managed-schools endpoint...')
    const usersResponse = await axios.get(`${BASE_URL}/users/managed-schools`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('Users retrieved:', usersResponse.data.users?.length || 0)

    // Step 5: Test template download
    console.log('\nStep 5: Testing template download...')
    const schoolId = schoolsResponse.data.schools?.[0]?._id

    if (schoolId) {
      const templateResponse = await axios.get(
        `${BASE_URL}/bulk-students/template?school_id=${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'arraybuffer',
        }
      )

      console.log('Template download successful!')
      console.log('Response type:', templateResponse.headers['content-type'])
      console.log('File size:', templateResponse.data.length, 'bytes')
    } else {
      console.log('No school found for template test')
    }

    console.log('\n✅ All tests passed!')
  } catch (error) {
    console.error('\n❌ Test failed:')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error(
        'Message:',
        error.response.data?.message || error.response.data
      )
      console.error('Debug info:', error.response.data?.debug)
    } else {
      console.error('Error:', error.message)
    }
  }
}

testAuthFlow()
