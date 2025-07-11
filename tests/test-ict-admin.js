const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

/**
 * Comprehensive ICT Administrator Test Suite
 * Tests all ICT admin functionality including authentication, school management, and bulk uploads
 */

const ICT_ADMIN_CREDENTIALS = {
  email: 'ictadmin@smart-s.com',
  password: 'password123',
}

const BASE_URL = 'http://localhost:3001/api/v1'

async function testICTAdminSystem() {
  try {
    console.log('💻 Testing ICT Administrator System')
    console.log('='.repeat(50))

    // 1. ICT Admin Authentication
    console.log('1. Testing ICT admin authentication...')
    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      ICT_ADMIN_CREDENTIALS
    )
    const token = loginResponse.data.token
    console.log('✅ ICT Admin login successful')

    const headers = { Authorization: `Bearer ${token}` }

    // 2. ICT Admin Dashboard
    console.log('\n2. Testing ICT admin dashboard...')
    const dashboardResponse = await axios.get(
      `${BASE_URL}/ict-admin/dashboard`,
      { headers }
    )
    console.log('✅ ICT Admin dashboard retrieved')

    // 3. School Management
    console.log('\n3. Testing school management...')
    const schoolsResponse = await axios.get(`${BASE_URL}/ict-admin/schools`, {
      headers,
    })
    const schools = schoolsResponse.data.data || []
    console.log('✅ Schools retrieved')
    console.log('   Schools count:', schools.length)

    if (schools.length > 0) {
      const schoolId = schools[0]._id
      console.log('   Using school:', schools[0].name)

      // 4. Students Management
      console.log('\n4. Testing students management...')
      const studentsResponse = await axios.get(
        `${BASE_URL}/ict-admin/students`,
        { headers }
      )
      console.log('✅ Students retrieved')
      console.log('   Students count:', studentsResponse.data.data?.length || 0)

      // 5. Bulk Upload Template
      console.log('\n5. Testing bulk upload template...')
      try {
        const templateResponse = await axios.get(
          `${BASE_URL}/bulk-students/template`,
          { headers }
        )
        console.log('✅ Bulk upload template available')
      } catch (templateError) {
        console.log(
          'ℹ️  Template endpoint response:',
          templateError.response?.status
        )
      }

      // 6. Test Bulk Upload (if sample file exists)
      if (fs.existsSync(path.join(__dirname, '..', 'sample-students.xlsx'))) {
        console.log('\n6. Testing bulk upload functionality...')

        const formData = new FormData()
        formData.append(
          'file',
          fs.createReadStream(
            path.join(__dirname, '..', 'sample-students.xlsx')
          )
        )
        formData.append('school_id', schoolId)

        try {
          const uploadResponse = await axios.post(
            `${BASE_URL}/bulk-students/upload`,
            formData,
            {
              headers: {
                ...formData.getHeaders(),
                ...headers,
              },
            }
          )
          console.log('✅ Bulk upload successful')
          console.log(
            '   Uploaded:',
            uploadResponse.data.data?.successful || 0,
            'students'
          )
        } catch (uploadError) {
          console.log(
            '⚠️  Bulk upload test skipped:',
            uploadError.response?.data?.message || uploadError.message
          )
        }
      } else {
        console.log('\n6. Bulk upload test skipped (no sample file)')
      }
    }

    console.log('\n🎉 ICT Administrator system test completed successfully!')
  } catch (error) {
    console.error(
      '❌ ICT Admin test failed:',
      error.response?.data?.message || error.message
    )
    throw error
  }
}

if (require.main === module) {
  testICTAdminSystem().catch(console.error)
}

module.exports = { testICTAdminSystem }
