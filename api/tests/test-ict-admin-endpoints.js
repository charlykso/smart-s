const http = require('http')

// First login as ICT Admin
console.log('Step 1: Testing ICT Admin login...')

const loginData = JSON.stringify({
  email: 'ict@greenwood.edu',
  password: 'password123',
})

const loginOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData),
  },
}

const loginReq = http.request(loginOptions, (res) => {
  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    try {
      const responseData = JSON.parse(data)
      if (res.statusCode === 200) {
        console.log('✅ ICT Admin login successful!')
        const token = responseData.data.token

        // Test schools endpoint
        console.log('\nStep 2: Testing /schools/by-group endpoint...')
        testEndpoint('/schools/by-group', token, (result) => {
          console.log(
            'Schools result:',
            result.success ? '✅ Success' : '❌ Failed'
          )
          if (result.data) {
            console.log(
              'Schools data:',
              result.data.schools?.length || 0,
              'schools found'
            )
          }

          // Test users endpoint
          console.log('\nStep 3: Testing /users/managed-schools endpoint...')
          testEndpoint('/users/managed-schools', token, (result) => {
            console.log(
              'Users result:',
              result.success ? '✅ Success' : '❌ Failed'
            )
            if (result.data) {
              console.log(
                'Users data:',
                result.data.users?.length || 0,
                'users found'
              )
            }

            // Test template download
            console.log('\nStep 4: Testing template download...')
            testEndpoint('/bulk-students/template', token, (result) => {
              console.log(
                'Template result:',
                result.success ? '✅ Success' : '❌ Failed'
              )
              if (result.error) {
                console.log('Template error:', result.error)
              }

              console.log('\n🎉 ICT Admin endpoint testing completed!')
              process.exit(0)
            })
          })
        })
      } else {
        console.log('❌ ICT Admin login failed')
        console.log('Response:', data)
        process.exit(1)
      }
    } catch (error) {
      console.log('Login parse error:', error.message)
      console.log('Response body:', data)
      process.exit(1)
    }
  })
})

function testEndpoint(path, token, callback) {
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
      try {
        const responseData = JSON.parse(data)
        callback({
          success: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          data: responseData,
        })
      } catch (error) {
        callback({
          success: false,
          status: res.statusCode,
          error: 'Parse error: ' + error.message,
          rawData: data,
        })
      }
    })
  })

  req.on('error', (error) => {
    callback({
      success: false,
      error: 'Request error: ' + error.message,
    })
  })

  req.setTimeout(5000, () => {
    req.destroy()
    callback({
      success: false,
      error: 'Request timeout',
    })
  })

  req.end()
}

loginReq.on('error', (e) => {
  console.error(`Login request error: ${e.message}`)
  process.exit(1)
})

loginReq.setTimeout(5000)
loginReq.write(loginData)
loginReq.end()
