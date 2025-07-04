#!/usr/bin/env node

/**
 * Test Script: Create Student User and Test Dashboard
 *
 * This script creates a test student account and tests the student dashboard functionality
 */

const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

// Admin credentials for creating users
const ADMIN_CREDENTIALS = {
  email: 'admin@smart-s.com',
  password: 'password123',
}

// Test student data
const STUDENT_DATA = {
  firstname: 'John',
  lastname: 'Student',
  email: 'john.student@smart-s.com',
  password: 'password123',
  roles: ['Student'],
  school_id: '6856ca374de0e2d916dc329c', // Smart School Academy
  regNo: 'STU001',
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

function logSuccess(message) {
  log(`✓ ${message}`, 'green')
}

function logError(message) {
  log(`✗ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow')
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'blue')
}

async function loginAdmin() {
  logStep(1, 'Admin Login')

  try {
    const response = await axios.post(
      `${API_BASE}/auth/login`,
      ADMIN_CREDENTIALS
    )

    if (response.data.success) {
      logSuccess('Admin login successful')
      return response.data.data.token
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

async function createStudent(adminToken) {
  logStep(2, 'Creating Test Student')

  try {
    const response = await axios.post(
      `${API_BASE}/user/student/create`,
      STUDENT_DATA,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    )

    if (response.data.success) {
      logSuccess('Student created successfully')
      logSuccess(`Student ID: ${response.data.data._id}`)
      logSuccess(`Email: ${STUDENT_DATA.email}`)
      return response.data.data
    } else {
      logWarning('Student creation failed: ' + response.data.message)
      if (response.data.message.includes('already exists')) {
        logWarning('Student already exists, will try to use existing account')
        return { email: STUDENT_DATA.email }
      }
      return null
    }
  } catch (error) {
    logError(
      'Student creation error: ' +
        (error.response?.data?.message || error.message)
    )
    if (error.response?.data?.message?.includes('already exists')) {
      logWarning('Student already exists, will try to use existing account')
      return { email: STUDENT_DATA.email }
    }
    return null
  }
}

async function loginStudent() {
  logStep(3, 'Testing Student Login')

  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: STUDENT_DATA.email,
      password: STUDENT_DATA.password,
    })

    if (response.data.success) {
      const user = response.data.data.user
      logSuccess('Student login successful')
      logSuccess(`User: ${user.firstname} ${user.lastname}`)
      logSuccess(`Roles: ${user.roles.join(', ')}`)
      logSuccess(
        `School: ${user.school?.name || user.school || 'Not assigned'}`
      )
      return {
        token: response.data.data.token,
        user: user,
      }
    } else {
      logError('Student login failed: ' + response.data.message)
      return null
    }
  } catch (error) {
    logError(
      'Student login error: ' + (error.response?.data?.message || error.message)
    )
    return null
  }
}

async function testStudentDashboard(studentToken) {
  logStep(4, 'Testing Student Dashboard API')

  try {
    const response = await axios.get(`${API_BASE}/student/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })

    if (response.data.success) {
      logSuccess('Student dashboard API working')
      const data = response.data.data

      log('\nDashboard Response:', 'blue')
      console.log(JSON.stringify(data, null, 2))

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

async function testStudentApprovedFees(studentToken) {
  logStep(5, 'Testing Student Approved Fees API')

  try {
    const response = await axios.get(`${API_BASE}/fee/student/approved-fees`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })

    if (response.data.success) {
      logSuccess('Student approved fees API working')
      const fees = response.data.data

      logSuccess(`Found ${fees?.length || 0} approved fees`)

      if (fees && fees.length > 0) {
        log('\nApproved Fees:', 'blue')
        fees.slice(0, 3).forEach((fee, index) => {
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
    return null
  }
}

async function runTests() {
  log('='.repeat(60), 'bold')
  log('  Student Dashboard Test with API Integration', 'bold')
  log('='.repeat(60), 'bold')

  // Step 1: Login as admin
  const adminToken = await loginAdmin()
  if (!adminToken) {
    logError('Cannot proceed without admin authentication')
    return
  }

  // Step 2: Create student (or use existing)
  const student = await createStudent(adminToken)
  if (!student) {
    logError('Cannot proceed without student account')
    return
  }

  // Step 3: Login as student
  const studentAuth = await loginStudent()
  if (!studentAuth) {
    logError('Cannot proceed without student authentication')
    return
  }

  // Step 4: Test student dashboard
  const dashboardData = await testStudentDashboard(studentAuth.token)

  // Step 5: Test student approved fees
  await testStudentApprovedFees(studentAuth.token)

  log('\n' + '='.repeat(60), 'bold')
  log('  Test Complete', 'bold')
  log('='.repeat(60), 'bold')

  if (dashboardData) {
    log('\n✓ RESULT: Student APIs are working correctly', 'green')
    log('✓ Frontend can now be updated to use these working endpoints', 'green')
  } else {
    log('\n⚠ RESULT: Student APIs need debugging', 'yellow')
    log('⚠ Check server logs and backend configuration', 'yellow')
  }
}

// Run the tests
runTests().catch((error) => {
  logError('Test runner error: ' + error.message)
  process.exit(1)
})
