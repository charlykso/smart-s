const http = require('http')

console.log('Testing ICT Admin login...')

const loginData = JSON.stringify({
  email: 'ict@greenwood.edu',
  password: 'password123',
})

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData),
  },
}

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`)

  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    try {
      const responseData = JSON.parse(data)
      if (res.statusCode === 200) {
        console.log('✅ ICT Admin login successful!')
        console.log('User:', responseData.data?.user?.email)
        console.log('Roles:', responseData.data?.user?.roles)
        console.log('School:', responseData.data?.user?.school)
        console.log('Token exists:', !!responseData.data?.token)
      } else {
        console.log('❌ ICT Admin login failed')
        console.log('Message:', responseData.message)
      }
      process.exit(0)
    } catch (error) {
      console.log('Response body:', data)
      process.exit(1)
    }
  })
})

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`)
  process.exit(1)
})

req.on('timeout', () => {
  console.error('Request timeout')
  req.destroy()
  process.exit(1)
})

req.setTimeout(5000)
req.write(loginData)
req.end()
