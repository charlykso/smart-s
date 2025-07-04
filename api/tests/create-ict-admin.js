const axios = require('axios')
require('dotenv').config()

const BASE_URL = 'http://localhost:3000/api/v1'
const ADMIN_EMAIL = 'admin@smart-s.com'
const ADMIN_PASSWORD = 'password123'

async function createICTAdmin() {
  console.log('🔧 Creating ICT Administrator for Smart School Academy...\n')

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...')
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })

    if (!adminLogin.data.success) {
      throw new Error('Admin login failed')
    }

    const adminToken = adminLogin.data.data.token
    console.log('✅ Admin login successful')

    // Step 2: Get the school ID for Smart School Academy
    console.log('\n2. Getting Smart School Academy details...')
    const schoolsResponse = await axios.get(`${BASE_URL}/admin/schools`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const smartSchool = schoolsResponse.data.schools.find(
      (school) => school.name === 'Smart School Academy'
    )

    if (!smartSchool) {
      throw new Error('Smart School Academy not found')
    }

    console.log(`✅ Found school: ${smartSchool.name} (ID: ${smartSchool._id})`)

    // Step 3: Create ICT Administrator
    console.log('\n3. Creating ICT Administrator...')

    const ictAdminData = {
      firstname: 'David',
      lastname: 'ICTAdmin',
      email: 'ictadmin@smart-s.com',
      password: 'password123',
      phone: '+1234567893',
      schoolId: smartSchool._id,
      regNo: 'ICT001',
      gender: 'Male',
      type: 'day',
    }

    try {
      const ictAdminResponse = await axios.post(
        `${BASE_URL}/admin/ict-administrators`,
        ictAdminData,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      )

      console.log('✅ ICT Administrator created successfully!')
      console.log('   Email: ictadmin@smart-s.com')
      console.log('   Password: password123')
      console.log(`   School: ${smartSchool.name}`)
      console.log('   Role: ICT_administrator')

      // Step 4: Test the new ICT Admin login
      console.log('\n4. Testing ICT Admin login...')
      const testLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'ictadmin@smart-s.com',
        password: 'password123',
      })

      if (testLogin.data.success) {
        console.log('✅ ICT Admin login test successful!')
        console.log(
          `   User: ${testLogin.data.data.user.firstname} ${testLogin.data.data.user.lastname}`
        )
        console.log(
          `   Roles: ${JSON.stringify(testLogin.data.data.user.roles)}`
        )
        console.log(`   School: ${testLogin.data.data.user.school?.name}`)
      }

      return true
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ ICT Administrator already exists with this email')

        // Test login for existing user
        console.log('\n4. Testing existing ICT Admin login...')
        try {
          const testLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'ictadmin@smart-s.com',
            password: 'password123',
          })

          if (testLogin.data.success) {
            console.log('✅ Existing ICT Admin login successful!')
            console.log(
              `   User: ${testLogin.data.data.user.firstname} ${testLogin.data.data.user.lastname}`
            )
            console.log(
              `   Roles: ${JSON.stringify(testLogin.data.data.user.roles)}`
            )
            console.log(`   School: ${testLogin.data.data.user.school?.name}`)
          }
        } catch (loginError) {
          console.log(
            '❌ Existing ICT Admin login failed:',
            loginError.response?.data?.message
          )
        }

        return true
      } else {
        console.log(
          '❌ ICT Administrator creation failed:',
          error.response?.data?.message || error.message
        )
        return false
      }
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
    return false
  }
}

// Execute if run directly
if (require.main === module) {
  createICTAdmin().then((success) => {
    if (success) {
      console.log('\n🎉 ICT Administrator setup completed!')
      console.log('\nICT Admin Login Details:')
      console.log('Email: ictadmin@smart-s.com')
      console.log('Password: password123')
      console.log('Role: ICT_administrator')
      console.log('School: Smart School Academy')
    } else {
      console.log('\n❌ ICT Administrator setup failed.')
    }
  })
}

module.exports = { createICTAdmin }
