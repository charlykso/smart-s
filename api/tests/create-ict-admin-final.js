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

    req.setTimeout(5000, () => {
      req.destroy()
      reject({ message: 'Request timeout' })
    })

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

async function createICTAdmin() {
  try {
    console.log('Creating ICT Admin...\n')

    // Step 1: Login as Admin
    console.log('Step 1: Logging in as Admin...')
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    const adminToken = loginResponse.data.token
    console.log('✅ Admin login successful!')

    // Step 2: Get existing school
    console.log('\nStep 2: Getting existing school...')
    const schoolsResponse = await makeRequest(
      '/school/all',
      'GET',
      null,
      adminToken
    )
    if (!schoolsResponse || schoolsResponse.length === 0) {
      throw new Error('No schools available')
    }
    const schoolId = schoolsResponse[0]._id
    console.log('✅ Using school:', schoolsResponse[0].name, 'ID:', schoolId)

    // Step 3: Create address first
    console.log('\nStep 3: Creating address...')
    let addressId = ''
    try {
      const addressData = {
        street: '123 ICT Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        country: 'Nigeria',
        postalCode: '12345',
      }

      const addressResponse = await makeRequest(
        '/address/',
        'POST',
        addressData,
        adminToken
      )
      addressId = addressResponse._id || addressResponse.id || ''
      console.log('✅ Address created successfully, ID:', addressId)
    } catch (error) {
      console.log('⚠️ Address creation failed:', error.message)
      console.log('Continuing with empty address_id...')
      addressId = ''
    }

    // Step 4: Create ICT Admin user
    console.log('\nStep 4: Creating ICT Admin user...')
    const ictAdminData = {
      school_id: schoolId,
      firstname: 'ICT',
      middlename: 'Test',
      lastname: 'Administrator',
      email: 'ict@greenwood.edu',
      phone: '+1234567890',
      address_id: addressId,
      DOB: '1990-01-01',
      gender: 'Male',
      roles: ['ICT_administrator'],
      password: 'password123',
    }

    try {
      console.log('Creating ICT Admin with data:', {
        school_id: ictAdminData.school_id,
        email: ictAdminData.email,
        address_id: ictAdminData.address_id,
      })

      const ictAdminResponse = await makeRequest(
        '/user/ict-admin/create',
        'POST',
        ictAdminData,
        adminToken
      )
      console.log(
        '✅ ICT Admin created successfully:',
        ictAdminResponse.email || ictAdminResponse.user?.email
      )
    } catch (error) {
      if (error.status === 400 && error.message.includes('already exists')) {
        console.log('ℹ️ ICT Admin user already exists, testing login...')
      } else {
        console.log('❌ ICT Admin creation failed:', error.message)
        console.log('Error details:', error.data)
        throw error
      }
    }

    // Step 5: Test ICT Admin login
    console.log('\nStep 5: Testing ICT Admin login...')
    try {
      const ictLoginResponse = await makeRequest('/auth/login', 'POST', {
        email: 'ict@greenwood.edu',
        password: 'password123',
      })

      console.log('✅ ICT Admin login successful!')
      console.log('ICT Admin details:', {
        id: ictLoginResponse.data.user._id,
        email: ictLoginResponse.data.user.email,
        roles: ictLoginResponse.data.user.roles,
        school: ictLoginResponse.data.user.school,
      })

      // Step 6: Test ICT Admin endpoints
      console.log('\nStep 6: Testing ICT Admin endpoints...')
      const ictToken = ictLoginResponse.data.token

      try {
        const schoolsResponse = await makeRequest(
          '/schools/by-group',
          'GET',
          null,
          ictToken
        )
        console.log('✅ Schools endpoint accessible')
        console.log(
          'Schools found:',
          schoolsResponse.success ? 'Success' : 'No success flag'
        )
      } catch (error) {
        console.log('❌ Schools endpoint error:', error.message)
      }

      try {
        const usersResponse = await makeRequest(
          '/users/managed-schools',
          'GET',
          null,
          ictToken
        )
        console.log('✅ Users endpoint accessible')
        console.log(
          'Users found:',
          usersResponse.success ? 'Success' : 'No success flag'
        )
      } catch (error) {
        console.log('❌ Users endpoint error:', error.message)
      }

      console.log('\n🎉 ICT Admin setup completed successfully!')
      console.log('\n📝 Credentials:')
      console.log('Email: ict@greenwood.edu')
      console.log('Password: password123')
    } catch (error) {
      console.log('❌ ICT Admin login failed:', error.message)
      throw error
    }
  } catch (error) {
    console.error('\n💥 Setup failed:')
    console.error('Error:', error.message)
    if (error.data) {
      console.error('Details:', JSON.stringify(error.data, null, 2))
    }
  }
}

createICTAdmin()
