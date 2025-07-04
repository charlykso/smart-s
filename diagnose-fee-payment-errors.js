#!/usr/bin/env node

/**
 * Test Script: Diagnose Student Fee Payment Errors
 *
 * This script tests the student API endpoints with the real student account
 * to identify and fix the session/authentication issues causing the errors.
 */

const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

// Real student credentials
const STUDENT_CREDENTIALS = {
  email: 'alice.student@smartschool.edu',
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
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow')
}

async function loginStudent() {
  logStep(1, 'Student Authentication')

  try {
    const response = await axios.post(
      `${API_BASE}/auth/login`,
      STUDENT_CREDENTIALS
    )

    if (response.data.success) {
      logSuccess('Student login successful')
      const user = response.data.data.user
      logSuccess(`User: ${user.firstname} ${user.lastname}`)
      logSuccess(`Email: ${user.email}`)
      logSuccess(`School: ${user.school?.name || 'Not assigned'}`)
      logSuccess(`School ID: ${user.school?._id || 'No school ID'}`)

      return {
        token: response.data.data.token,
        refreshToken: response.data.data.refreshToken,
        user: user,
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
  logStep(2, 'Testing Student Dashboard API (/student/dashboard)')

  try {
    const response = await axios.get(`${API_BASE}/student/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.data.success) {
      logSuccess('Student dashboard API working')
      const data = response.data.data

      // Log financial data
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
      } else {
        logWarning('No financial data returned')
      }

      // Log current term
      if (data.currentTerm) {
        logSuccess(`Current term: ${data.currentTerm.name}`)
        logSuccess(`Session: ${data.currentTerm.session?.name || 'N/A'}`)
      } else {
        logWarning('No current term data')
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

    if (error.response?.status === 401) {
      logError('🔒 Authentication failed - token may be expired or invalid')
    }
    return null
  }
}

async function testStudentOutstandingFees(token) {
  logStep(3, 'Testing Outstanding Fees API (/student/outstanding-fees)')

  try {
    const response = await axios.get(`${API_BASE}/student/outstanding-fees`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
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
        data.outstandingFees.slice(0, 3).forEach((fee, index) => {
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

async function testApprovedFees(token) {
  logStep(4, 'Testing Approved Fees API (/fee/student/approved-fees)')

  try {
    const response = await axios.get(`${API_BASE}/fee/student/approved-fees`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.data.success) {
      logSuccess('Approved fees API working')
      const fees = response.data.data

      logSuccess(`Found ${fees?.length || 0} approved fees`)

      if (fees && fees.length > 0) {
        log('\nApproved Fees for Student:', 'blue')
        fees.slice(0, 5).forEach((fee, index) => {
          log(
            `  ${index + 1}. ${fee.name} - ₦${fee.amount?.toLocaleString()} (${
              fee.type
            })`,
            'reset'
          )
          log(
            `     Term: ${fee.term?.name || 'N/A'}, Session: ${
              fee.term?.session?.name || 'N/A'
            }`,
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
  logStep(
    5,
    'Testing Payment Methods API (/payment/available-methods/:schoolId)'
  )

  if (!schoolId) {
    logWarning('No school ID available, skipping payment methods test')
    return []
  }

  try {
    const response = await axios.get(
      `${API_BASE}/payment/available-methods/${schoolId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
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
        'This may indicate no payment profile is configured for the school'
      )
      return []
    }
  } catch (error) {
    logWarning(
      'Payment methods API error: ' +
        (error.response?.data?.message || error.message)
    )
    logWarning('Status: ' + (error.response?.status || 'Network Error'))
    return []
  }
}

async function testStudentPayments(token) {
  logStep(6, 'Testing Student Payments History API (/student/payments)')

  try {
    const response = await axios.get(`${API_BASE}/student/payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
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
          log(
            `     Date: ${new Date(payment.trans_date).toLocaleDateString()}`,
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

async function runDiagnostics() {
  log('='.repeat(70), 'bold')
  log('  STUDENT FEE PAYMENT ERROR DIAGNOSIS', 'bold')
  log('='.repeat(70), 'bold')

  // Step 1: Login
  const authData = await loginStudent()
  if (!authData) {
    logError('Cannot proceed without authentication')
    return
  }

  const { token, user } = authData

  // Step 2: Test all student APIs
  const dashboardData = await testStudentDashboard(token)
  const outstandingFees = await testStudentOutstandingFees(token)
  const approvedFees = await testApprovedFees(token)
  const paymentMethods = await testPaymentMethods(token, user.school?._id)
  const paymentsHistory = await testStudentPayments(token)

  // Summary
  log('\n' + '='.repeat(70), 'bold')
  log('  DIAGNOSIS SUMMARY', 'bold')
  log('='.repeat(70), 'bold')

  const apiResults = [
    { name: 'Student Login', status: authData ? 'WORKING' : 'FAILED' },
    { name: 'Dashboard API', status: dashboardData ? 'WORKING' : 'FAILED' },
    {
      name: 'Outstanding Fees API',
      status: outstandingFees ? 'WORKING' : 'FAILED',
    },
    { name: 'Approved Fees API', status: approvedFees ? 'WORKING' : 'FAILED' },
    {
      name: 'Payment Methods API',
      status: paymentMethods.length > 0 ? 'WORKING' : 'NO DATA',
    },
    {
      name: 'Payments History API',
      status: paymentsHistory ? 'WORKING' : 'FAILED',
    },
  ]

  apiResults.forEach((result) => {
    const color =
      result.status === 'WORKING'
        ? 'green'
        : result.status === 'NO DATA'
        ? 'yellow'
        : 'red'
    log(`${result.name}: ${result.status}`, color)
  })

  log('\n📋 NEXT STEPS:', 'blue')

  if (dashboardData) {
    log(
      '✅ Backend APIs are working - issue is likely in frontend integration',
      'green'
    )
    log('• Update StudentDashboard.tsx to use correct API endpoints', 'yellow')
    log('• Fix token handling in frontend API calls', 'yellow')
    log('• Ensure proper error handling for API failures', 'yellow')
  } else {
    log('❌ Backend APIs have issues - need to fix server-side first', 'red')
    log('• Check backend authentication middleware', 'yellow')
    log('• Verify database connections and data integrity', 'yellow')
    log('• Review server logs for errors', 'yellow')
  }

  log('\n🔧 Ready to fix frontend implementation!', 'green')
}

// Run the diagnostics
runDiagnostics().catch((error) => {
  logError('Diagnostic runner error: ' + error.message)
  process.exit(1)
})
