const http = require('http')

// Helper function to test endpoint
function testEndpoint(path, token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1' + path,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        console.log(`Status ${res.statusCode} for ${path}`)
        try {
          const responseData = JSON.parse(data)
          console.log('Response:', JSON.stringify(responseData, null, 2))
        } catch (error) {
          console.log('Raw response:', data)
        }
        resolve()
      })
    })

    req.on('error', (error) => {
      console.log(`Error for ${path}:`, error.message)
      resolve()
    })

    req.setTimeout(3000, () => {
      console.log(`Timeout for ${path}`)
      req.destroy()
      resolve()
    })

    req.end()
  })
}

async function debugICTAdminAccess() {
  console.log('Debugging ICT Admin access...\n')

  // Login as Admin first to test if admin endpoints work
  console.log('=== Testing Admin Access ===')
  const adminLoginData = JSON.stringify({
    email: 'admin@ledgrio.com',
    password: 'password123',
  })

  const adminLoginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(adminLoginData),
    },
  }

  const adminLoginReq = http.request(adminLoginOptions, async (res) => {
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', async () => {
      try {
        const adminResponse = JSON.parse(data)
        const adminToken = adminResponse.data.token
        console.log('✅ Admin login successful')

        await testEndpoint('/schools/by-group', adminToken)

        // Now test ICT Admin
        console.log('\n=== Testing ICT Admin Access ===')
        const ictLoginData = JSON.stringify({
          email: 'ict@greenwood.edu',
          password: 'password123',
        })

        const ictLoginOptions = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/v1/auth/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(ictLoginData),
          },
        }

        const ictLoginReq = http.request(ictLoginOptions, async (res) => {
          let data = ''
          res.on('data', (chunk) => {
            data += chunk
          })

          res.on('end', async () => {
            try {
              const ictResponse = JSON.parse(data)
              const ictToken = ictResponse.data.token
              console.log('✅ ICT Admin login successful')
              console.log('ICT Admin school:', ictResponse.data.user.school)

              await testEndpoint('/schools/by-group', ictToken)

              process.exit(0)
            } catch (error) {
              console.log('ICT login parse error:', error.message)
              process.exit(1)
            }
          })
        })

        ictLoginReq.write(ictLoginData)
        ictLoginReq.end()
      } catch (error) {
        console.log('Admin login parse error:', error.message)
        process.exit(1)
      }
    })
  })

  adminLoginReq.write(adminLoginData)
  adminLoginReq.end()
}

debugICTAdminAccess()
