#!/usr/bin/env node

/**
 * Test Script: Student API Endpoints
 *
 * This script tests the student-specific API endpoints to diagnose session/authentication issues
 */

const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

// Test credentials for student
const STUDENT_CREDENTIALS = {
  email: 'student@smart-s.com',
  password: 'password123',
}

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset)
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'blue')
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green')
}

function logError(message) {
  log(`✗ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow')
}

async function loginStudent() {
  logStep(1, 'Testing Student Login')

  try {
    const response = await axios.post(
      `${API_BASE}/auth/login`,
      STUDENT_CREDENTIALS
    )

    if (response.data.success) {
      logSuccess('Student login successful')
      logSuccess(
        `User: ${response.data.data.user.firstname} ${response.data.data.user.lastname}`
      )
      logSuccess(`Role: ${response.data.data.user.roles.join(', ')}`)
      logSuccess(
        `School ID: ${response.data.data.user.school || 'Not assigned'}`
      )
      return {
        token: response.data.data.token,
        refreshToken: response.data.data.refreshToken,
        user: response.data.data.user,
      }
    } else {
      logError('Login failed: ' + response.data.message)
      return null
    }
  } catch (error) {
    logError('Login error: ' + (error.response?.data?.message || error.message))
    return null
  }
}

async function testStudentDashboard(token) {
  logStep(2, 'Testing Student Dashboard API')

  try {
    const response = await axios.get(`${API_BASE}/student/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.data.success) {
      logSuccess('Student dashboard API working')
      const data = response.data.data

      log('\nDashboard Data:', 'blue')
      console.log(JSON.stringify(data, null, 2))

      if (data.financial) {
        logSuccess(
          `Outstanding fees: ₦${
            data.financial.totalOutstanding?.toLocaleString() || 0
          }`
        )
        logSuccess(
          `Total paid: ₦${data.financial.totalPaid?.toLocaleString() || 0}`
        )
        logSuccess(
          `Recent payments: ${data.financial.recentPayments?.length || 0}`
        )
      }

      if (data.currentTerm) {
        logSuccess(`Current term: ${data.currentTerm.name}`)
        logSuccess(
          `Current session: ${data.currentTerm.session?.name || 'N/A'}`
        )
      }

      return data
    } else {
      logError('Dashboard API error: ' + response.data.message)
      return null
    }
  } catch (error) {
    logError(
      'Dashboard API error: ' + (error.response?.data?.message || error.message)
    )
    logError('Status: ' + (error.response?.status || 'Network Error'))
    return null
  }
}

async function testStudentPayments(token) {
  logStep(3, 'Testing Student Payments API')

  try {
    const response = await axios.get(`${API_BASE}/student/payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.data.success) {
      logSuccess('Student payments API working')
      const data = response.data.data

      logSuccess(`Found ${data.payments?.length || 0} payments`)

      if (data.payments && data.payments.length > 0) {
        log('\nRecent Payments:', 'blue')
        data.payments.slice(0, 3).forEach((payment, index) => {
          log(
            `  ${index + 1}. ${
              payment.fee?.name || 'Unknown'
            } - ₦${payment.amount?.toLocaleString()} (${payment.status})`,
            'reset'
          )
        })
      }

      return data
    } else {
      logError('Payments API error: ' + response.data.message)
      return null
    }
  } catch (error) {
    logError(
      'Payments API error: ' + (error.response?.data?.message || error.message)
    )
    logError('Status: ' + (error.response?.status || 'Network Error'))
    return null
  }
}

async function testStudentOutstandingFees(token) {
  logStep(4, 'Testing Student Outstanding Fees API')

  try {
    const response = await axios.get(`${API_BASE}/student/outstanding-fees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.data.success) {
      logSuccess('Outstanding fees API working')
      const data = response.data.data

      logSuccess(
        `Total outstanding: ₦${data.totalAmount?.toLocaleString() || 0}`
      )
      logSuccess(`Outstanding fees count: ${data.outstandingFees?.length || 0}`)

      if (data.outstandingFees && data.outstandingFees.length > 0) {
        log('\nOutstanding Fees:', 'blue')
        data.outstandingFees.forEach((fee, index) => {
          log(
            `  ${index + 1}. ${fee.name} - ₦${fee.amount?.toLocaleString()} (${
              fee.type
            })`,
            'reset'
          )
        })
      }

      return data
    } else {
      logError('Outstanding fees API error: ' + response.data.message)
      return null
    }
  } catch (error) {
    logError(
      'Outstanding fees API error: ' +
        (error.response?.data?.message || error.message)
    )
    logError('Status: ' + (error.response?.status || 'Network Error'))
    return null
  }
}

async function testApprovedFees(token, schoolId) {
  logStep(5, 'Testing Student Approved Fees API')

  try {
    const response = await axios.get(`${API_BASE}/fee/student/approved-fees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.data.success) {
      logSuccess('Approved fees API working')
      const fees = response.data.data

      logSuccess(`Found ${fees?.length || 0} approved fees`)

      if (fees && fees.length > 0) {
        log('\nApproved Fees:', 'blue')
        fees.slice(0, 5).forEach((fee, index) => {
          log(
            `  ${index + 1}. ${fee.name} - ₦${fee.amount?.toLocaleString()} (${
              fee.type
            })`,
            'reset'
          )
        })
      }

      return fees
    } else {
      logError('Approved fees API error: ' + response.data.message)
      return null
    }
  } catch (error) {
    logError(
      'Approved fees API error: ' +
        (error.response?.data?.message || error.message)
    )
    logError('Status: ' + (error.response?.status || 'Network Error'))
    return null
  }
}

async function testPaymentMethods(token, schoolId) {
  logStep(6, 'Testing Payment Methods API')

  try {
    const response = await axios.get(
      `${API_BASE}/payment/available-methods/${schoolId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response.data.success) {
      logSuccess('Payment methods API working')
      const methods = response.data.data

      logSuccess(`Found ${methods?.length || 0} payment methods`)

      if (methods && methods.length > 0) {
        log('\nAvailable Payment Methods:', 'blue')
        methods.forEach((method, index) => {
          log(
            `  ${index + 1}. ${method.name} (${method.method}) - ${
              method.enabled ? 'Enabled' : 'Disabled'
            }`,
            'reset'
          )
          log(`     ${method.description}`, 'reset')
        })
      }

      return methods
    } else {
      logWarning('Payment methods API returned error: ' + response.data.error)
      logWarning(
        'This is expected if no payment profile is configured for the school'
      )
      return []
    }
  } catch (error) {
    logWarning(
      'Payment methods API error: ' +
        (error.response?.data?.message || error.message)
    )
    logWarning(
      'This is expected if no payment profile is configured for the school'
    )
    return []
  }
}

async function runTests() {
  log('='.repeat(60), 'bold')
  log('  Student API Endpoints Test', 'bold')
  log('='.repeat(60), 'bold')

  // Step 1: Login
  const authData = await loginStudent()
  if (!authData) {
    logError('Cannot proceed without authentication')
    return
  }

  const { token, user } = authData

  // Step 2: Test Dashboard
  await testStudentDashboard(token)

  // Step 3: Test Payments
  await testStudentPayments(token)

  // Step 4: Test Outstanding Fees
  await testStudentOutstandingFees(token)

  // Step 5: Test Approved Fees
  await testApprovedFees(token, user.school)

  // Step 6: Test Payment Methods
  if (user.school) {
    await testPaymentMethods(token, user.school)
  } else {
    logWarning('Student has no school assigned, skipping payment methods test')
  }

  log('\n' + '='.repeat(60), 'bold')
  log('  Test Complete', 'bold')
  log('='.repeat(60), 'bold')

  log('\nNext Steps:', 'yellow')
  log('1. Check server logs for any backend errors')
  log('2. Verify database connections and data integrity')
  log('3. Test frontend integration with these working APIs')
}

// Run the tests
runTests().catch((error) => {
  logError('Test runner error: ' + error.message)
  process.exit(1)
})
