const { spawn } = require('child_process')
const axios = require('./api/node_modules/axios/dist/node/axios.cjs')
const path = require('path')

/**
 * Comprehensive Test Runner with Server Management
 * This script starts the server and runs all tests
 */

const BASE_URL = 'http://localhost:3000/api/v1'
let serverProcess = null

// Test credentials
const TEST_CREDENTIALS = {
  admin: { email: 'admin@ledgrio.com', password: 'KGnd#%$ld' },
  ictAdmin: { email: 'ictadmin@smart-s.com', password: 'password123' },
  principal: { email: 'principal@smart-s.com', password: 'password123' },
  bursar: { email: 'bursar@smart-s.com', password: 'password123' },
  student: { email: 'student@smart-s.com', password: 'password123' }
}

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Ledgrio API Server...')
    
    const serverPath = path.join(__dirname, 'api', 'server.js')
    serverProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, 'api'),
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let serverStarted = false

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString()
      console.log('Server:', output.trim())
      
      if (output.includes('Server is running on port') && !serverStarted) {
        serverStarted = true
        console.log('✅ Server started successfully')
        setTimeout(resolve, 2000) // Wait 2 seconds for full startup
      }
    })

    serverProcess.stderr.on('data', (data) => {
      console.error('Server Error:', data.toString())
    })

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error)
      reject(error)
    })

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverStarted) {
        reject(new Error('Server startup timeout'))
      }
    }, 30000)
  })
}

function stopServer() {
  if (serverProcess) {
    console.log('🛑 Stopping server...')
    serverProcess.kill()
    serverProcess = null
  }
}

async function testUserLogin(userType, credentials) {
  try {
    console.log(`\n🔐 Testing ${userType} login...`)
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials)

    // Extract token from nested data structure
    const token = response.data.data?.token || response.data.token

    if (token) {
      console.log(`✅ ${userType} login successful`)
      return token
    } else {
      throw new Error(`No token received. Response: ${JSON.stringify(response.data)}`)
    }
  } catch (error) {
    console.log(`❌ ${userType} login failed:`, error.response?.data?.message || error.message)
    if (error.response?.data) {
      console.log(`Debug - Error response:`, JSON.stringify(error.response.data, null, 2))
    }
    throw error
  }
}

async function testUserProfile(userType, token) {
  try {
    console.log(`👤 Testing ${userType} profile access...`)
    const response = await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data.user) {
      console.log(`✅ ${userType} profile accessed: ${response.data.user.firstname} ${response.data.user.lastname}`)
      return response.data.user
    } else {
      throw new Error('No user data received')
    }
  } catch (error) {
    console.log(`❌ ${userType} profile access failed:`, error.response?.data?.message || error.message)
    throw error
  }
}

async function testSystemAdmin(token) {
  try {
    console.log('\n📊 Testing System Admin capabilities...')

    // Test user management
    const usersResponse = await axios.get(`${BASE_URL}/user/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`✅ User management: ${usersResponse.data.data?.length || 0} users found`)

    // Test school management
    const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`✅ School management: ${schoolsResponse.data.data?.length || 0} schools found`)

    return true
  } catch (error) {
    console.log('❌ System Admin test failed:', error.response?.data?.message || error.message)
    return false
  }
}

async function testICTAdmin(token) {
  try {
    console.log('\n💻 Testing ICT Admin capabilities...')

    // Test dashboard access
    const dashboardResponse = await axios.get(`${BASE_URL}/ict-admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('✅ ICT Admin dashboard accessed')

    // Test school access
    const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`✅ ICT Admin school access: ${schoolsResponse.data.data?.length || 0} schools accessible`)

    return true
  } catch (error) {
    console.log('❌ ICT Admin test failed:', error.response?.data?.message || error.message)
    return false
  }
}

async function testBursar(token) {
  try {
    console.log('\n💰 Testing Bursar capabilities...')
    
    // Test fee management
    const feesResponse = await axios.get(`${BASE_URL}/fee/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`✅ Fee management: ${feesResponse.data.data?.length || 0} fees found`)
    
    return true
  } catch (error) {
    console.log('❌ Bursar test failed:', error.response?.data?.message || error.message)
    return false
  }
}

async function testPrincipal(token) {
  try {
    console.log('\n🎓 Testing Principal capabilities...')

    // Test dashboard access
    const dashboardResponse = await axios.get(`${BASE_URL}/principal/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('✅ Principal dashboard accessed')

    // Test academic overview
    const academicResponse = await axios.get(`${BASE_URL}/principal/academic-overview`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('✅ Principal academic overview accessed')

    return true
  } catch (error) {
    console.log('❌ Principal test failed:', error.response?.data?.message || error.message)
    return false
  }
}

async function testStudent(token) {
  try {
    console.log('\n🎒 Testing Student capabilities...')

    // Test outstanding fees
    const feesResponse = await axios.get(`${BASE_URL}/student/outstanding-fees`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`✅ Student outstanding fees: ${feesResponse.data.data?.totalOutstanding || 0} amount outstanding`)

    // Test payment history
    const paymentsResponse = await axios.get(`${BASE_URL}/student/payments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log(`✅ Payment history: ${paymentsResponse.data.data?.length || 0} payments found`)

    // Test dashboard
    const dashboardResponse = await axios.get(`${BASE_URL}/student/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('✅ Student dashboard accessed')

    return true
  } catch (error) {
    console.log('❌ Student test failed:', error.response?.data?.message || error.message)
    return false
  }
}

async function runComprehensiveTests() {
  console.log('🏫 LEDGRIO - Comprehensive School Accounting System Test')
  console.log('='.repeat(70))
  
  const results = {
    serverStart: false,
    admin: false,
    ictAdmin: false,
    principal: false,
    bursar: false,
    student: false
  }

  try {
    // Start server
    await startServer()
    results.serverStart = true

    // Test each user type
    for (const [userType, credentials] of Object.entries(TEST_CREDENTIALS)) {
      try {
        const token = await testUserLogin(userType, credentials)
        await testUserProfile(userType, token)
        
        // Run specific tests based on user type
        let specificTestResult = false
        switch (userType) {
          case 'admin':
            specificTestResult = await testSystemAdmin(token)
            break
          case 'ictAdmin':
            specificTestResult = await testICTAdmin(token)
            break
          case 'bursar':
            specificTestResult = await testBursar(token)
            break
          case 'principal':
            specificTestResult = await testPrincipal(token)
            break
          case 'student':
            specificTestResult = await testStudent(token)
            break
        }
        
        results[userType] = specificTestResult
        
      } catch (error) {
        console.log(`❌ ${userType} tests failed`)
        results[userType] = false
      }
    }

  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
  } finally {
    stopServer()
  }

  // Print summary
  console.log('\n📊 COMPREHENSIVE TEST SUMMARY')
  console.log('='.repeat(70))
  console.log(`Server Startup:     ${results.serverStart ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`System Admin:       ${results.admin ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`ICT Admin:          ${results.ictAdmin ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Principal:          ${results.principal ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Bursar:             ${results.bursar ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Student:            ${results.student ? '✅ PASSED' : '❌ FAILED'}`)

  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length

  console.log('\n' + '='.repeat(70))
  console.log(`OVERALL RESULT: ${passedTests}/${totalTests} components passed`)

  if (passedTests === totalTests) {
    console.log('🎉 ALL SYSTEMS FULLY OPERATIONAL!')
  } else if (passedTests >= totalTests * 0.8) {
    console.log('⚠️  Most systems operational with minor issues.')
  } else {
    console.log('❌ Critical system issues detected.')
  }

  return results
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, cleaning up...')
  stopServer()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...')
  stopServer()
  process.exit(0)
})

// Run tests if this file is executed directly
if (require.main === module) {
  runComprehensiveTests()
    .then((results) => {
      const allPassed = Object.values(results).every(Boolean)
      process.exit(allPassed ? 0 : 1)
    })
    .catch((error) => {
      console.error('Test runner failed:', error)
      stopServer()
      process.exit(1)
    })
}

module.exports = { runComprehensiveTests }
