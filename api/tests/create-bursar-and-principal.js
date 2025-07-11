const axios = require('axios')
require('dotenv').config()

// Use environment variables for configuration
const PORT = process.env.PORT || 3000
const BASE_URL = `http://localhost:${PORT}/api/v1`

// Known admin credentials from seed-database.js and environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@smart-s.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123'

async function loginAsAdmin() {
  try {
    console.log(`🔑 Attempting admin login with: ${ADMIN_EMAIL}`)
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })

    if (adminLogin.data.success) {
      console.log(`✅ Admin login successful`)
      return adminLogin.data.data.token
    }

    throw new Error('Admin login failed: Invalid response')
  } catch (error) {
    console.log(
      `❌ Admin login failed: ${error.response?.data?.message || error.message}`
    )
    throw new Error(`Admin authentication failed. Please ensure:
    1. The server is running on port ${PORT}
    2. The admin user exists (run: node tests/seed-database.js)
    3. Database is accessible`)
  }
}

async function createBursarForSchool() {
  try {
    console.log('🔧 Creating Bursar for School...\n')

    // Get admin token using the proper credentials
    console.log('1. Authenticating as admin...')
    const adminToken = await loginAsAdmin()

    // Get existing schools
    console.log('\n2. Getting existing schools...')
    let schools = []
    try {
      const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      schools = schoolsResponse.data
      console.log(`Found ${schools.length} schools`)
      schools.forEach((school) => {
        console.log(`   - ${school.name} (ID: ${school._id})`)
      })
    } catch (error) {
      console.log('❌ Could not fetch schools:', error.response?.data?.message)
      return false
    }

    if (schools.length === 0) {
      console.log('❌ No schools found. Please create a school first.')
      return false
    }

    // Use the first available school
    const targetSchool = schools[0]
    console.log(`\n3. Creating bursar for school: ${targetSchool.name}`)

    // Create bursar
    try {
      const bursarData = {
        firstname: 'Michael',
        lastname: 'Bursar',
        email: 'bursar@smart-s.com',
        password: 'password123',
        phone: '+1234567891',
        school: targetSchool._id,
        regNo: 'BUR001',
        gender: 'Male',
        roles: ['Bursar'],
      }

      await axios.post(`${BASE_URL}/user/bursar/create`, bursarData, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      console.log('✅ Bursar created successfully!')
      console.log('   Email: bursar@smart-s.com')
      console.log('   Password: password123')
      console.log(`   School: ${targetSchool.name}`)

      return true
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Bursar already exists with this email')
        return true
      } else {
        console.log('❌ Bursar creation failed:', error.response?.data?.message)
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
async function createPrincipalForSchool() {
  try {
    console.log('\n4. Creating Principal for School...')

    // Get admin token using the proper credentials
    const adminToken = await loginAsAdmin()

    // Get schools
    const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const schools = schoolsResponse.data

    if (schools.length === 0) {
      console.log('❌ No schools found for principal creation.')
      return false
    }

    const targetSchool = schools[0]

    // Create principal
    try {
      const principalData = {
        firstname: 'Dr. Sarah',
        lastname: 'Principal',
        email: 'principal@smart-s.com',
        password: 'password123',
        phone: '+1234567892',
        school: targetSchool._id,
        regNo: 'PRI001',
        gender: 'Female',
        roles: ['Principal'],
      }

      await axios.post(`${BASE_URL}/user/principal/create`, principalData, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      console.log('✅ Principal created successfully!')
      console.log('   Email: principal@smart-s.com')
      console.log('   Password: password123')
      console.log(`   School: ${targetSchool.name}`)

      return true
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Principal already exists with this email')
        return true
      } else {
        console.log(
          '❌ Principal creation failed:',
          error.response?.data?.message
        )
        return false
      }
    }
  } catch (error) {
    console.error('❌ Principal creation failed:', error.message)
    return false
  }
}

// Run the setup
async function setupUsers() {
  console.log('🚀 Starting User Setup Process...')
  console.log(`📡 Using server: ${BASE_URL}`)
  console.log(`🔑 Admin credentials: ${ADMIN_EMAIL}`)

  try {
    const bursarCreated = await createBursarForSchool()
    const principalCreated = await createPrincipalForSchool()

    if (bursarCreated && principalCreated) {
      console.log('\n🎉 Setup completed successfully!')
      console.log('\nTest Users Created:')
      console.log('Bursar: bursar@smart-s.com / password123')
      console.log('Principal: principal@smart-s.com / password123')
      console.log('\nYou can now run the access control tests.')
    } else {
      console.log('\n❌ Setup incomplete. Check the errors above.')
    }
  } catch (error) {
    console.error('\n💥 Setup process failed:', error.message)
    console.log('\n🔧 Troubleshooting steps:')
    console.log('1. Ensure the server is running: cd api && node server.js')
    console.log(
      '2. Verify admin user exists: cd api && node tests/seed-database.js'
    )
    console.log('3. Check database connection in .env file')
  }
}

// Execute if run directly
if (require.main === module) {
  setupUsers()
}

module.exports = { setupUsers, createBursarForSchool, createPrincipalForSchool }
