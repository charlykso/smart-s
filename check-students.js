#!/usr/bin/env node

/**
 * Script to check existing students
 */

const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@smart-s.com',
  password: 'password123',
}

async function getAdminToken() {
  try {
    const response = await axios.post(
      `${API_BASE}/auth/login`,
      ADMIN_CREDENTIALS
    )

    if (response.data.success) {
      console.log('✅ Admin login successful')
      return response.data.data.token
    } else {
      console.log('❌ Login failed:', response.data.message)
      return null
    }
  } catch (error) {
    console.error(
      '❌ Login error:',
      error.response?.data?.message || error.message
    )
    return null
  }
}

async function getStudents(token) {
  try {
    const response = await axios.get(`${API_BASE}/user/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.data && response.data.data) {
      console.log('\n📚 Found Students:')
      response.data.data.forEach((student, index) => {
        console.log(`${index + 1}. ${student.firstname} ${student.lastname}`)
        console.log(`   Email: ${student.email}`)
        console.log(`   Reg No: ${student.regNo}`)
        console.log(`   School: ${student.school?.name || 'Not assigned'}`)
        console.log('')
      })
      return response.data.data
    } else {
      console.log('📚 No students found')
      return []
    }
  } catch (error) {
    console.error(
      '❌ Error getting students:',
      error.response?.data?.message || error.message
    )
    return []
  }
}

async function getSchools(token) {
  try {
    const response = await axios.get(`${API_BASE}/school/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.data && Array.isArray(response.data)) {
      console.log('\n🏫 Found Schools:')
      response.data.forEach((school, index) => {
        console.log(`${index + 1}. ${school.name} (ID: ${school._id})`)
      })
      return response.data
    } else {
      console.log('🏫 No schools found')
      return []
    }
  } catch (error) {
    console.error(
      '❌ Error getting schools:',
      error.response?.data?.message || error.message
    )
    return []
  }
}

async function testStudentLogin(students) {
  if (students.length === 0) {
    console.log('❌ No students to test login with')
    return
  }

  console.log('\n🔑 Testing Student Login:')

  for (const student of students) {
    try {
      // Try to login with student email and default password
      const testCredentials = {
        email: student.email,
        password: 'password123', // Common test password
      }

      const response = await axios.post(
        `${API_BASE}/auth/login`,
        testCredentials
      )

      if (response.data.success) {
        console.log(
          `✅ ${student.firstname} ${student.lastname} login successful`
        )
        console.log(`   Token obtained for testing fee APIs`)
        return {
          student: student,
          token: response.data.data.token,
          user: response.data.data.user,
        }
      }
    } catch (error) {
      console.log(
        `❌ ${student.firstname} ${student.lastname} login failed: ${
          error.response?.data?.message || 'Wrong password'
        }`
      )
    }
  }

  console.log('❌ No students could be logged in with default password')
  return null
}

async function main() {
  console.log('='.repeat(50))
  console.log(' Checking Existing Students')
  console.log('='.repeat(50))

  const token = await getAdminToken()
  if (!token) {
    console.log('❌ Cannot proceed without admin token')
    return
  }

  const schools = await getSchools(token)
  const students = await getStudents(token)

  if (students.length > 0) {
    const studentAuth = await testStudentLogin(students)

    if (studentAuth) {
      console.log(
        '\n✅ Ready to test fee payment APIs with this student account'
      )
      console.log(
        `Student: ${studentAuth.user.firstname} ${studentAuth.user.lastname}`
      )
      console.log(`Email: ${studentAuth.user.email}`)
      console.log(`School: ${studentAuth.user.school?.name || 'Not assigned'}`)
    }
  }

  console.log('\n' + '='.repeat(50))
}

main().catch(console.error)
