const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testAuthFlow() {
  try {
    console.log('Testing authentication flow...\n')

    // Step 1: Login as Admin
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
      school: userResponse.data.user.school,
    })

    // Step 3: Test template download with Admin (should be allowed)
    console.log('\nStep 3: Testing template download as Admin...')

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

      console.log('Template download successful!')
      console.log('Response type:', templateResponse.headers['content-type'])
      console.log('File size:', templateResponse.data.length, 'bytes')
    } catch (templateError) {
      console.log(
        'Template download failed:',
        templateError.response?.status,
        templateError.response?.data || templateError.message
      )
    }

    console.log('\n✅ Basic auth tests passed!')

    // Now test ICT Admin if it exists
    console.log('\n=== ICT Admin Tests ===')
    try {
      const ictLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'ict@greenwood.edu',
        password: 'password123',
      })

      const ictToken = ictLoginResponse.data.data.token
      console.log('ICT Admin login successful!')
      console.log('ICT Admin user:', {
        id: ictLoginResponse.data.data.user._id,
        email: ictLoginResponse.data.data.user.email,
        roles: ictLoginResponse.data.data.user.roles,
        school: ictLoginResponse.data.data.user.school,
      })

      // Test ICT Admin endpoints
      console.log('\nTesting ICT Admin endpoints...')

      const ictUserResponse = await axios.get(`${BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${ictToken}`,
        },
      })

      console.log('ICT Admin user info:', {
        id: ictUserResponse.data.user._id,
        email: ictUserResponse.data.user.email,
        roles: ictUserResponse.data.user.roles,
        school: ictUserResponse.data.user.school,
      })

      // Test schools by group
      const schoolsResponse = await axios.get(`${BASE_URL}/schools/by-group`, {
        headers: {
          Authorization: `Bearer ${ictToken}`,
        },
      })

      console.log(
        'Schools retrieved:',
        schoolsResponse.data.schools?.length || 0
      )
    } catch (ictError) {
      console.log(
        "ICT Admin test failed (expected if user doesn't exist):",
        ictError.response?.data?.message || ictError.message
      )
    }
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
