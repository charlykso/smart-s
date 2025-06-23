const http = require('http')
require('dotenv').config()

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 second timeout
    }

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData)
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`
    }

    const req = http.request(options, (res) => {
      let responseData = ''

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed)
          } else {
            reject({
              status: res.statusCode,
              message: parsed.message || 'Request failed',
              data: parsed,
            })
          }
        } catch (error) {
          reject({
            status: res.statusCode,
            message: 'Invalid JSON response',
            data: responseData,
          })
        }
      })
    })

    req.on('error', (error) => {
      reject({ message: error.message })
    })

    req.on('timeout', () => {
      req.destroy()
      reject({ message: 'Request timeout' })
    })

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

async function createICTAdminSimple() {
  try {
    console.log('Creating ICT Admin (simple approach)...\n')

    // Step 1: Login as Admin
    console.log('Step 1: Logging in as Admin...')
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    const adminToken = loginResponse.data.token
    console.log('Admin login successful!')

    // Step 2: Create ICT Admin with just the first available school
    // We'll skip the complex group school/school creation and just use what exists
    console.log('\nStep 2: Creating ICT Admin user...')
    // Let's assume a school with ID exists, or create user without school first
    const ictAdminData = {
      school_id: '', // We'll leave this empty for now
      firstname: 'ICT',
      middlename: '',
      lastname: 'Administrator',
      email: 'ict@greenwood.edu',
      phone: '+1234567890',
      address_id: '', // We'll leave this empty for now
      DOB: '1990-01-01',
      gender: 'Male',
      roles: ['ICT_administrator'],
      password: 'password123',
    }

    try {
      const ictAdminResponse = await makeRequest(
        '/user/ict-admin/create',
        'POST',
        ictAdminData,
        adminToken
      )
      console.log(
        'ICT Admin created successfully:',
        ictAdminResponse.user.email
      )

      // Step 3: Test ICT Admin login
      console.log('\nStep 3: Testing ICT Admin login...')
      const ictLoginResponse = await makeRequest('/auth/login', 'POST', {
        email: 'ict@greenwood.edu',
        password: 'password123',
      })

      console.log('ICT Admin login successful!')
      console.log('ICT Admin details:', {
        id: ictLoginResponse.data.user._id,
        email: ictLoginResponse.data.user.email,
        roles: ictLoginResponse.data.user.roles,
        school: ictLoginResponse.data.user.school,
      })

      // Step 4: Test accessing ICT Admin endpoints
      console.log('\nStep 4: Testing ICT Admin endpoints...')
      const ictToken = ictLoginResponse.data.token

      try {
        const schoolsResponse = await makeRequest(
          '/schools/by-group',
          'GET',
          null,
          ictToken
        )
        console.log('Schools endpoint works:', schoolsResponse.success)
      } catch (error) {
        console.log('Schools endpoint error:', error.message)
      }

      try {
        const usersResponse = await makeRequest(
          '/users/managed-schools',
          'GET',
          null,
          ictToken
        )
        console.log('Users endpoint works:', usersResponse.success)
      } catch (error) {
        console.log('Users endpoint error:', error.message)
      }

      console.log('\n✅ ICT Admin setup completed successfully!')
      console.log('\nCredentials:')
      console.log('Email: ict@greenwood.edu')
      console.log('Password: password123')
    } catch (error) {
      if (error.status === 409) {
        console.log('ICT Admin user already exists, testing login...')

        const ictLoginResponse = await makeRequest('/auth/login', 'POST', {
          email: 'ict@greenwood.edu',
          password: 'password123',
        })

        console.log('ICT Admin login successful!')
        console.log('Existing ICT Admin details:', {
          id: ictLoginResponse.data.user._id,
          email: ictLoginResponse.data.user.email,
          roles: ictLoginResponse.data.user.roles,
          school: ictLoginResponse.data.user.school,
        })

        console.log('\n✅ ICT Admin already exists and working!')
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('\n❌ Setup failed:')
    console.error('Error:', error.message)
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2))
    }
  }
}

createICTAdminSimple()
