const http = require('http')

// Test login and student loading
async function testStudentLoading() {
  console.log('=== Testing Student Loading for Bursar ===\n')

  // Step 1: Login as bursar
  console.log('1. Logging in as bursar...')
  const loginData = JSON.stringify({
    email: 'bursar@smart-s.com',
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

  return new Promise((resolve, reject) => {
    const req = http.request(loginOptions, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          console.log('Login Response Status:', res.statusCode)
          console.log('Login Success:', response.success)

          if (response.success && response.token) {
            console.log('✅ Login successful!')
            console.log('User roles:', response.user?.roles)
            console.log('User school:', response.user?.school)

            // Step 2: Test student loading
            console.log('\n2. Loading students...')
            testUserEndpoint(response.token)
              .then(() => resolve())
              .catch(reject)
          } else {
            console.log('❌ Login failed:', response.message)
            resolve()
          }
        } catch (e) {
          console.error('❌ Error parsing login response:', e)
          resolve()
        }
      })
    })

    req.on('error', (e) => {
      console.error('❌ Login request error:', e)
      resolve()
    })

    req.write(loginData)
    req.end()
  })
}

function testUserEndpoint(token) {
  return new Promise((resolve, reject) => {
    const userOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/school-access/users?role=Student',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }

    const userReq = http.request(userOptions, (userRes) => {
      let userData = ''
      userRes.on('data', (chunk) => (userData += chunk))
      userRes.on('end', () => {
        try {
          const userResponse = JSON.parse(userData)
          console.log('Users Endpoint Status:', userRes.statusCode)
          console.log('Users Response Success:', userResponse.success)

          if (userResponse.success) {
            console.log('✅ Users endpoint successful!')
            console.log(
              'Total users found:',
              userResponse.data?.users?.length || 0
            )

            if (userResponse.data?.users?.length > 0) {
              console.log('\n📋 Students found:')
              userResponse.data.users.forEach((user, index) => {
                console.log(
                  `  ${index + 1}. ${user.firstname} ${user.lastname} (${
                    user.regNo
                  }) - Roles: ${JSON.stringify(user.roles)}`
                )
              })
            } else {
              console.log('⚠️  No students found in the response')
            }
          } else {
            console.log('❌ Users endpoint failed:', userResponse.message)
          }

          // Step 3: Test without role filter
          console.log('\n3. Testing without role filter...')
          testAllUsersEndpoint(token)
            .then(() => resolve())
            .catch(reject)
        } catch (e) {
          console.error('❌ Error parsing users response:', e)
          console.log('Raw response:', userData)
          resolve()
        }
      })
    })

    userReq.on('error', (e) => {
      console.error('❌ Users request error:', e)
      resolve()
    })

    userReq.end()
  })
}

function testAllUsersEndpoint(token) {
  return new Promise((resolve) => {
    const userOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/school-access/users',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }

    const userReq = http.request(userOptions, (userRes) => {
      let userData = ''
      userRes.on('data', (chunk) => (userData += chunk))
      userRes.on('end', () => {
        try {
          const userResponse = JSON.parse(userData)
          console.log('All Users Endpoint Status:', userRes.statusCode)
          console.log('All Users Response Success:', userResponse.success)

          if (userResponse.success) {
            console.log('✅ All users endpoint successful!')
            console.log(
              'Total users found:',
              userResponse.data?.users?.length || 0
            )

            if (userResponse.data?.users?.length > 0) {
              console.log('\n📋 All users by role:')
              const usersByRole = {}
              userResponse.data.users.forEach((user) => {
                user.roles?.forEach((role) => {
                  if (!usersByRole[role]) usersByRole[role] = []
                  usersByRole[role].push(
                    `${user.firstname} ${user.lastname} (${user.regNo})`
                  )
                })
              })

              Object.keys(usersByRole).forEach((role) => {
                console.log(`  ${role}: ${usersByRole[role].length} users`)
                usersByRole[role].forEach((user) =>
                  console.log(`    - ${user}`)
                )
              })
            }
          } else {
            console.log('❌ All users endpoint failed:', userResponse.message)
          }
        } catch (e) {
          console.error('❌ Error parsing all users response:', e)
        }
        resolve()
      })
    })

    userReq.on('error', (e) => {
      console.error('❌ All users request error:', e)
      resolve()
    })

    userReq.end()
  })
}

// Run the test
testStudentLoading()
  .then(() => {
    console.log('\n=== Test Completed ===')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Test failed:', err)
    process.exit(1)
  })
