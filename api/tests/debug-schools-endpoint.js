const http = require('http')
require('dotenv').config()

// Helper function to make HTTP requests with timeout
function makeRequest(
  path,
  method = 'GET',
  data = null,
  token = null,
  timeoutMs = 5000
) {
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
          resolve({
            status: res.statusCode,
            data: parsed,
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
          })
        }
      })
    })

    req.on('error', (error) => {
      reject({ message: error.message })
    })

    // Set a timeout
    const timeout = setTimeout(() => {
      req.destroy()
      reject({ message: `Request timeout after ${timeoutMs}ms` })
    }, timeoutMs)

    req.on('response', () => {
      clearTimeout(timeout)
    })

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

async function debugSchoolsEndpoint() {
  try {
    console.log('🔍 Debugging schools endpoint...\n')

    // Step 1: Login as ICT Admin
    console.log('Step 1: Logging in as ICT Admin...')
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'ict@greenwood.edu',
      password: 'password123',
    })

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.data)
      return
    }

    const ictToken = loginResponse.data.data.token
    console.log('✅ ICT Admin login successful')

    // Step 2: Test schools endpoint with short timeout
    console.log('\nStep 2: Testing schools endpoint with 5s timeout...')
    try {
      const schoolsResponse = await makeRequest(
        '/schools/by-group',
        'GET',
        null,
        ictToken,
        5000
      )
      console.log('✅ Schools endpoint response received')
      console.log('   Status:', schoolsResponse.status)

      if (schoolsResponse.status === 200) {
        console.log(
          '   Schools found:',
          schoolsResponse.data.schools?.length || 0
        )
        if (schoolsResponse.data.schools?.length > 0) {
          console.log('   First school:', {
            name: schoolsResponse.data.schools[0].name,
            userCount: schoolsResponse.data.schools[0].userCount,
          })
        }
      } else {
        console.log('   Error response:', schoolsResponse.data)
      }
    } catch (error) {
      console.log('❌ Schools endpoint failed:', error.message)

      if (error.message.includes('timeout')) {
        console.log(
          '   The endpoint is hanging - likely a database query issue'
        )

        // Step 3: Test simpler endpoints to isolate the issue
        console.log('\nStep 3: Testing simpler endpoints...')

        try {
          console.log('   Testing /users/me...')
          const meResponse = await makeRequest(
            '/users/me',
            'GET',
            null,
            ictToken,
            3000
          )
          console.log('   /users/me status:', meResponse.status)
        } catch (meError) {
          console.log('   /users/me failed:', meError.message)
        }
      }
    }

    // Step 4: Test as Admin user for comparison
    console.log('\nStep 4: Testing same endpoint as Admin...')
    try {
      const adminLoginResponse = await makeRequest('/auth/login', 'POST', {
        email: 'admin@ledgrio.com',
        password: 'password123',
      })

      if (adminLoginResponse.status === 200) {
        const adminToken = adminLoginResponse.data.data.token
        console.log('✅ Admin login successful')

        const adminSchoolsResponse = await makeRequest(
          '/schools/by-group',
          'GET',
          null,
          adminToken,
          5000
        )
        console.log('✅ Admin schools endpoint works')
        console.log(
          '   Schools found:',
          adminSchoolsResponse.data.schools?.length || 0
        )
      }
    } catch (adminError) {
      console.log('❌ Admin test failed:', adminError.message)
    }

    console.log('\n🔍 Debugging completed')
  } catch (error) {
    console.error('\n❌ Debug failed:', error.message)
  }
}

debugSchoolsEndpoint()
