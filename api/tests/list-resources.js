const http = require('http')
require('dotenv').config()

// Helper function to make HTTP requests with shorter timeout
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

    // Set a shorter timeout
    req.setTimeout(3000, () => {
      console.log(`Request to ${path} timed out`)
      req.destroy()
      reject({ message: 'Request timeout' })
    })

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

async function listResources() {
  try {
    console.log('Listing existing resources...\n')

    // Step 1: Login as Admin
    console.log('Step 1: Logging in as Admin...')
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    const adminToken = loginResponse.data.token
    console.log('Admin login successful!')

    // Step 2: Try to get schools (with timeout)
    console.log('\nStep 2: Trying to get schools...')
    try {
      const schoolsResponse = await makeRequest(
        '/school/all',
        'GET',
        null,
        adminToken
      )
      console.log('Schools found:', schoolsResponse.length || 0)
      if (schoolsResponse.length > 0) {
        console.log('First school:', {
          id: schoolsResponse[0]._id,
          name: schoolsResponse[0].name,
        })
      }
    } catch (error) {
      console.log('Failed to get schools:', error.message)
    }

    // Step 3: Try to get existing users
    console.log('\nStep 3: Trying to get ICT admins...')
    try {
      const usersResponse = await makeRequest(
        '/user/ict-administrators/all',
        'GET',
        null,
        adminToken
      )
      console.log('ICT Admins found:', usersResponse.length || 0)
    } catch (error) {
      console.log('Failed to get ICT admins:', error.message)
    }

    console.log('\nCompleted resource listing.')
  } catch (error) {
    console.error('\n❌ Error:')
    console.error('Message:', error.message)
  }
}

listResources()
