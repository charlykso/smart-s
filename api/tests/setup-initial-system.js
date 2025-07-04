const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function setupInitialSystem() {
  console.log('🚀 Setting up initial system with admin and test users...\n')

  try {
    // Step 1: Create a proprietor (which can create other users)
    console.log('1. Creating proprietor (system admin)...')
    try {
      const proprietorData = {
        firstname: 'System',
        lastname: 'Admin',
        email: 'admin@smart-s.com',
        password: 'password123',
        phone: '+1234567890',
        regNo: 'PROP001',
      }

      const proprietorResponse = await axios.post(
        `${BASE_URL}/user/proprietor/create`,
        proprietorData
      )
      console.log('✅ Proprietor created successfully!')
      console.log('   Email: admin@smart-s.com')
      console.log('   Password: password123')
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Proprietor already exists')
      } else {
        console.log(
          '❌ Proprietor creation failed:',
          error.response?.data?.message
        )
        throw error
      }
    }

    // Step 2: Login as proprietor to get token
    console.log('\n2. Logging in as proprietor...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@smart-s.com',
      password: 'password123',
    })

    const adminToken = loginResponse.data.data.token
    console.log('✅ Proprietor login successful')

    // Step 3: Create a school
    console.log('\n3. Creating test school...')
    let schoolId = null
    try {
      const schoolData = {
        name: 'Greenwood High School',
        address: '123 Education Street',
        email: 'admin@greenwood.edu',
        phone: '+1234567890',
        establishedYear: 2020,
        schoolType: 'Secondary',
        website: 'www.greenwoodhigh.edu',
      }

      const schoolResponse = await axios.post(
        `${BASE_URL}/school/create`,
        schoolData,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      )

      schoolId = schoolResponse.data.data._id
      console.log('✅ School created successfully!')
      console.log(`   Name: ${schoolData.name}`)
      console.log(`   ID: ${schoolId}`)
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(
          'ℹ️ School might already exist, fetching existing schools...'
        )

        const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })

        const existingSchool = schoolsResponse.data.find(
          (school) => school.name === 'Greenwood High School'
        )

        if (existingSchool) {
          schoolId = existingSchool._id
          console.log(
            `✅ Using existing school: ${existingSchool.name} (ID: ${schoolId})`
          )
        } else {
          console.log('❌ Could not find or create school')
          throw error
        }
      } else {
        console.log('❌ School creation failed:', error.response?.data?.message)
        throw error
      }
    }

    // Step 4: Create bursar
    console.log('\n4. Creating bursar for the school...')
    try {
      const bursarData = {
        firstname: 'Michael',
        lastname: 'Bursar',
        email: 'bursar@smart-s.com',
        password: 'password123',
        phone: '+1234567891',
        school: schoolId,
        regNo: 'BUR001',
      }

      await axios.post(`${BASE_URL}/user/bursar/create`, bursarData, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      console.log('✅ Bursar created successfully!')
      console.log('   Email: bursar@smart-s.com')
      console.log('   Password: password123')
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Bursar already exists')
      } else {
        console.log('❌ Bursar creation failed:', error.response?.data?.message)
        throw error
      }
    }

    // Step 5: Create principal
    console.log('\n5. Creating principal for the school...')
    try {
      const principalData = {
        firstname: 'Dr. Sarah',
        lastname: 'Principal',
        email: 'principal@smart-s.com',
        password: 'password123',
        phone: '+1234567892',
        school: schoolId,
        regNo: 'PRI001',
      }

      await axios.post(`${BASE_URL}/user/principal/create`, principalData, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      console.log('✅ Principal created successfully!')
      console.log('   Email: principal@smart-s.com')
      console.log('   Password: password123')
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Principal already exists')
      } else {
        console.log(
          '❌ Principal creation failed:',
          error.response?.data?.message
        )
        throw error
      }
    }

    // Summary
    console.log('\n🎉 System setup completed successfully!')
    console.log('\n📋 Created Users:')
    console.log('👑 Proprietor: admin@smart-s.com / password123')
    console.log('💰 Bursar: bursar@smart-s.com / password123')
    console.log('🏫 Principal: principal@smart-s.com / password123')
    console.log('\n🏢 Created School:')
    console.log(`📚 ${schoolData.name} (ID: ${schoolId})`)
    console.log('\n✅ You can now run the access control tests!')
  } catch (error) {
    console.error('\n❌ System setup failed:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
      console.error('Status:', error.response.status)
    }
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure the server is running (node server.js)')
    console.log('2. Check if the database is connected')
    console.log('3. Verify the API endpoints are accessible')
  }
}

// Run the setup
setupInitialSystem()
