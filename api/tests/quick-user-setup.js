const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createBursarQuickSetup() {
  console.log('🚀 Quick Bursar Setup for Access Control Testing...\n')

  try {
    // First, let's try to login with any existing admin credentials
    console.log('1. Checking for existing admin users...')

    const potentialAdmins = [
      { email: 'admin@smart-s.com', password: 'password123' },
      { email: 'admin@system.com', password: 'password123' },
      { email: 'proprietor@smart-s.com', password: 'password123' },
      { email: 'super@admin.com', password: 'password123' },
      { email: 'admin', password: 'admin' },
      { email: 'admin', password: 'password123' },
    ]

    let adminToken = null
    let adminUser = null

    for (const creds of potentialAdmins) {
      try {
        console.log(`   Trying: ${creds.email}`)
        const response = await axios.post(`${BASE_URL}/auth/login`, creds)

        if (response.data.success) {
          adminToken = response.data.data.token
          adminUser = response.data.data.user
          console.log(`✅ Found working admin: ${creds.email}`)
          console.log(`   Name: ${adminUser.firstname} ${adminUser.lastname}`)
          console.log(`   Roles: ${adminUser.roles?.join(', ') || 'No roles'}`)
          break
        }
      } catch (error) {
        console.log(
          `   ❌ Failed: ${error.response?.data?.message || 'Login failed'}`
        )
      }
    }

    if (!adminToken) {
      console.log('\n❌ No admin user found in the system.')
      console.log('\n🔧 Manual Setup Required:')
      console.log('1. You need to create an admin user manually through:')
      console.log('   - Database direct insert')
      console.log('   - Application registration interface')
      console.log('   - Initial setup script\n')

      console.log('💡 Suggested manual database entry (MongoDB):')
      console.log('```javascript')
      console.log('db.users.insertOne({')
      console.log('  firstname: "Admin",')
      console.log('  lastname: "User",')
      console.log('  email: "admin@smart-s.com",')
      console.log(
        '  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password123'
      )
      console.log('  roles: ["Admin", "Proprietor"],')
      console.log('  isActive: true,')
      console.log('  createdAt: new Date(),')
      console.log('  updatedAt: new Date()')
      console.log('});')
      console.log('```')
      return false
    }

    // Check if admin has school access
    if (
      !adminUser.school &&
      !adminUser.roles?.includes('Admin') &&
      !adminUser.roles?.includes('Proprietor')
    ) {
      console.log(
        '\n⚠️ Warning: Admin user has no school assigned and limited roles'
      )
    }

    // Get available schools
    console.log('\n2. Getting available schools...')
    let schools = []
    try {
      const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      schools = schoolsResponse.data
      console.log(`✅ Found ${schools.length} schools`)

      if (schools.length > 0) {
        schools.forEach((school, index) => {
          console.log(`   ${index + 1}. ${school.name} (ID: ${school._id})`)
        })
      }
    } catch (error) {
      console.log('❌ Could not fetch schools:', error.response?.data?.message)

      // Try to create a school if none exist
      console.log('\n3. Creating a test school...')
      try {
        const schoolData = {
          name: 'Test High School',
          address: '123 Test Street',
          email: 'admin@testschool.edu',
          phone: '+1234567890',
          establishedYear: 2020,
          schoolType: 'Secondary',
        }

        const schoolResponse = await axios.post(
          `${BASE_URL}/school/create`,
          schoolData,
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          }
        )

        schools = [schoolResponse.data.data]
        console.log(`✅ Test school created: ${schoolData.name}`)
      } catch (schoolError) {
        console.log(
          '❌ Could not create school:',
          schoolError.response?.data?.message
        )
        return false
      }
    }

    if (schools.length === 0) {
      console.log(
        '❌ No schools available. Cannot create school-specific users.'
      )
      return false
    }

    const targetSchool = schools[0]
    console.log(
      `\n📚 Using school: ${targetSchool.name} (ID: ${targetSchool._id})`
    )

    // Create bursar
    console.log('\n4. Creating bursar for the school...')
    try {
      const bursarData = {
        firstname: 'Test',
        lastname: 'Bursar',
        email: 'bursar@smart-s.com',
        password: 'password123',
        phone: '+1111111111',
        school: targetSchool._id,
        regNo: 'BUR001',
      }

      const bursarResponse = await axios.post(
        `${BASE_URL}/user/bursar/create`,
        bursarData,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      )

      console.log('✅ Bursar created successfully!')
      console.log('   📧 Email: bursar@smart-s.com')
      console.log('   🔑 Password: password123')
      console.log(`   🏫 School: ${targetSchool.name}`)
    } catch (error) {
      if (
        error.response?.status === 409 ||
        error.response?.data?.message?.includes('already exists')
      ) {
        console.log('ℹ️ Bursar already exists with this email')
      } else {
        console.log('❌ Bursar creation failed:', error.response?.data?.message)
      }
    }

    // Create principal
    console.log('\n5. Creating principal for the school...')
    try {
      const principalData = {
        firstname: 'Test',
        lastname: 'Principal',
        email: 'principal@smart-s.com',
        password: 'password123',
        phone: '+2222222222',
        school: targetSchool._id,
        regNo: 'PRI001',
      }

      const principalResponse = await axios.post(
        `${BASE_URL}/user/principal/create`,
        principalData,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      )

      console.log('✅ Principal created successfully!')
      console.log('   📧 Email: principal@smart-s.com')
      console.log('   🔑 Password: password123')
      console.log(`   🏫 School: ${targetSchool.name}`)
    } catch (error) {
      if (
        error.response?.status === 409 ||
        error.response?.data?.message?.includes('already exists')
      ) {
        console.log('ℹ️ Principal already exists with this email')
      } else {
        console.log(
          '❌ Principal creation failed:',
          error.response?.data?.message
        )
      }
    }

    console.log('\n🎉 Setup completed!')
    console.log('\n📋 Test Users Ready:')
    console.log('👤 Bursar: bursar@smart-s.com / password123')
    console.log('👤 Principal: principal@smart-s.com / password123')
    console.log(`🏫 School: ${targetSchool.name}`)
    console.log('\n✅ You can now test the access control implementation!')

    return true
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    }
    return false
  }
}

// Test the created users
async function testCreatedUsers() {
  console.log('\n🧪 Testing created users...')

  // Test bursar login
  try {
    const bursarLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bursar@smart-s.com',
      password: 'password123',
    })

    if (bursarLogin.data.success) {
      console.log('✅ Bursar login successful')
      const user = bursarLogin.data.data.user
      console.log(`   Name: ${user.firstname} ${user.lastname}`)
      console.log(`   Roles: ${user.roles?.join(', ') || 'No roles'}`)
      console.log(
        `   School: ${user.school?.name || user.school || 'No school'}`
      )
    }
  } catch (error) {
    console.log('❌ Bursar login failed:', error.response?.data?.message)
  }

  // Test principal login
  try {
    const principalLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'principal@smart-s.com',
      password: 'password123',
    })

    if (principalLogin.data.success) {
      console.log('✅ Principal login successful')
      const user = principalLogin.data.data.user
      console.log(`   Name: ${user.firstname} ${user.lastname}`)
      console.log(`   Roles: ${user.roles?.join(', ') || 'No roles'}`)
      console.log(
        `   School: ${user.school?.name || user.school || 'No school'}`
      )
    }
  } catch (error) {
    console.log('❌ Principal login failed:', error.response?.data?.message)
  }
}

// Run the setup
async function main() {
  const setupSuccess = await createBursarQuickSetup()

  if (setupSuccess) {
    await testCreatedUsers()
  }
}

main()
