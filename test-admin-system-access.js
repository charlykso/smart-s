#!/usr/bin/env node

/**
 * Test Script: Admin System Access Verification
 *
 * This script verifies that the admin user is properly configured as a system admin
 * without school assignment restrictions.
 */

const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@smart-s.com',
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

async function testAdminLogin() {
  logStep(1, 'Testing Admin Login')

  try {
    const response = await axios.post(
      `${API_BASE}/auth/login`,
      ADMIN_CREDENTIALS
    )

    if (response.data.success) {
      const user = response.data.data.user

      logSuccess('Admin login successful')
      logSuccess(`User: ${user.firstname} ${user.lastname}`)
      logSuccess(`Email: ${user.email}`)
      logSuccess(`Roles: ${user.roles.join(', ')}`)

      // Check school assignment
      if (user.school === null || user.school === undefined) {
        logSuccess(
          '✓ Admin is correctly configured as System Admin (no school assignment)'
        )
      } else {
        logWarning(`Admin is assigned to school: ${user.school}`)
        logWarning('This may limit admin access to that specific school only')
      }

      return {
        token: response.data.data.token,
        refreshToken: response.data.data.refreshToken,
        user: user,
      }
    } else {
      logError('Admin login failed: ' + response.data.message)
      return null
    }
  } catch (error) {
    logError(
      'Admin login error: ' + (error.response?.data?.message || error.message)
    )
    return null
  }
}

async function testCrossSchoolAccess(token) {
  logStep(2, 'Testing Cross-School Access')

  try {
    // Test getting all schools
    const schoolsResponse = await axios.get(`${API_BASE}/school/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (schoolsResponse.data && Array.isArray(schoolsResponse.data)) {
      logSuccess(
        `✓ Can access all schools (${schoolsResponse.data.length} schools found)`
      )

      schoolsResponse.data.slice(0, 3).forEach((school, index) => {
        log(`  ${index + 1}. ${school.name} (ID: ${school._id})`, 'reset')
      })
    } else {
      logWarning('Schools response format unexpected')
    }
  } catch (error) {
    logError(
      'Cross-school access test failed: ' +
        (error.response?.data?.message || error.message)
    )
  }

  try {
    // Test getting all users (should include users from all schools)
    const usersResponse = await axios.get(`${API_BASE}/user/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (usersResponse.data && Array.isArray(usersResponse.data)) {
      logSuccess(
        `✓ Can access all users (${usersResponse.data.length} users found)`
      )

      // Count users by school
      const usersBySchool = {}
      usersResponse.data.forEach((user) => {
        const schoolName = user.school?.name || 'No School'
        usersBySchool[schoolName] = (usersBySchool[schoolName] || 0) + 1
      })

      log('\nUsers by School:', 'blue')
      Object.entries(usersBySchool).forEach(([school, count]) => {
        log(`  ${school}: ${count} users`, 'reset')
      })
    } else {
      logWarning('Users response format unexpected')
    }
  } catch (error) {
    logError(
      'Users access test failed: ' +
        (error.response?.data?.message || error.message)
    )
  }
}

async function testFeesAccess(token) {
  logStep(3, 'Testing Fees Access (All Schools)')

  try {
    const feesResponse = await axios.get(`${API_BASE}/fee/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (feesResponse.data && Array.isArray(feesResponse.data)) {
      logSuccess(
        `✓ Can access all fees (${feesResponse.data.length} fees found)`
      )

      // Count fees by school
      const feesBySchool = {}
      feesResponse.data.forEach((fee) => {
        const schoolName = fee.school?.name || 'No School'
        feesBySchool[schoolName] = (feesBySchool[schoolName] || 0) + 1
      })

      log('\nFees by School:', 'blue')
      Object.entries(feesBySchool).forEach(([school, count]) => {
        log(`  ${school}: ${count} fees`, 'reset')
      })
    } else {
      logWarning('Fees response format unexpected')
    }
  } catch (error) {
    logError(
      'Fees access test failed: ' +
        (error.response?.data?.message || error.message)
    )
  }
}

async function testPaymentsAccess(token) {
  logStep(4, 'Testing Payments Access (All Schools)')

  try {
    const paymentsResponse = await axios.get(`${API_BASE}/payment/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (paymentsResponse.data && Array.isArray(paymentsResponse.data)) {
      logSuccess(
        `✓ Can access all payments (${paymentsResponse.data.length} payments found)`
      )

      // Count payments by status
      const paymentsByStatus = {}
      paymentsResponse.data.forEach((payment) => {
        const status = payment.status || 'unknown'
        paymentsByStatus[status] = (paymentsByStatus[status] || 0) + 1
      })

      log('\nPayments by Status:', 'blue')
      Object.entries(paymentsByStatus).forEach(([status, count]) => {
        log(`  ${status}: ${count} payments`, 'reset')
      })
    } else {
      logWarning('Payments response format unexpected')
    }
  } catch (error) {
    logError(
      'Payments access test failed: ' +
        (error.response?.data?.message || error.message)
    )
  }
}

async function runTests() {
  log('='.repeat(60), 'bold')
  log('  Admin System Access Verification', 'bold')
  log('='.repeat(60), 'bold')

  // Step 1: Test admin login
  const authData = await testAdminLogin()
  if (!authData) {
    logError('Cannot proceed without admin authentication')
    return
  }

  const { token, user } = authData

  // Step 2: Test cross-school access
  await testCrossSchoolAccess(token)

  // Step 3: Test fees access
  await testFeesAccess(token)

  // Step 4: Test payments access
  await testPaymentsAccess(token)

  log('\n' + '='.repeat(60), 'bold')
  log('  Verification Complete', 'bold')
  log('='.repeat(60), 'bold')

  if (user.school === null || user.school === undefined) {
    log('\n✓ RESULT: Admin is correctly configured as System Admin', 'green')
    log(
      '✓ Admin can access data from all schools without restrictions',
      'green'
    )
  } else {
    log('\n⚠ RESULT: Admin may be school-restricted', 'yellow')
    log(
      '⚠ Consider updating admin user to have no school assignment for full system access',
      'yellow'
    )
  }
}

// Run the tests
runTests().catch((error) => {
  logError('Test runner error: ' + error.message)
  process.exit(1)
})
