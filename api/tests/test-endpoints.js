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
          console.log(`${method} ${path} - Status: ${res.statusCode}`)
          console.log('Response:', JSON.stringify(parsed, null, 2))
          resolve(parsed)
        } catch (error) {
          console.log(`${method} ${path} - Status: ${res.statusCode}`)
          console.log('Raw response:', responseData)
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

    req.setTimeout(10000, () => {
      req.destroy()
      reject({ message: 'Request timeout' })
    })

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

async function testEndpoints() {
  try {
    console.log('Testing endpoints...\n')

    // Step 1: Login as Admin
    console.log('Step 1: Logging in as Admin...')
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    const adminToken = loginResponse.data.token
    console.log('Admin login successful!\n')

    // Step 2: Test Group Schools endpoints
    console.log('Step 2: Testing Group Schools endpoints...')

    try {
      await makeRequest('/groupSchool/all', 'GET', null, adminToken)
    } catch (error) {
      console.log('Error getting group schools:', error.message)
    }

    console.log('\n')

    // Step 3: Test Schools endpoints
    console.log('Step 3: Testing Schools endpoints...')

    try {
      await makeRequest('/school/all', 'GET', null, adminToken)
    } catch (error) {
      console.log('Error getting schools:', error.message)
    }
  } catch (error) {
    console.error('\n❌ Test failed:')
    console.error('Error:', error.message)
  }
}

testEndpoints()
