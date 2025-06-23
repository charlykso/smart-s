const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function setupTestUsers() {
  try {
    console.log('🔧 Setting up test users for access control testing...\n')

    // First we need to create an admin to create other users
    // Let's try to login as admin or create one
    let adminToken = null
    
    try {
      console.log('1. Attempting admin login...')
      const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@smart-s.com',
        password: 'password123'
      })
      adminToken = adminLogin.data.data.token
      console.log('✅ Admin login successful')
    } catch (error) {
      console.log('❌ Admin login failed, need to create admin manually first')
      console.log('Please create an admin user through the application first')
      return
    }

    // Create a test school first
    console.log('\n2. Creating test school...')
    let testSchoolId = null
    try {
      const schoolResponse = await axios.post(`${BASE_URL}/school/create`, {
        name: 'Greenwood High School',
        address: '123 Education Street',
        email: 'admin@greenwood.edu',
        phone: '+1234567890',
        establishedYear: 2020,
        schoolType: 'Secondary',
        website: 'www.greenwoodhigh.edu'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      
      testSchoolId = schoolResponse.data.data._id
      console.log(`✅ Test school created with ID: ${testSchoolId}`)
    } catch (error) {
      console.log('ℹ️ School might already exist or create failed:', error.response?.data?.message)
      
      // Try to get existing schools
      try {
        const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
        const existingSchool = schoolsResponse.data.find(school => 
          school.name === 'Greenwood High School'
        )
        if (existingSchool) {
          testSchoolId = existingSchool._id
          console.log(`✅ Using existing school with ID: ${testSchoolId}`)
        }
      } catch (err) {
        console.log('❌ Could not get schools:', err.response?.data?.message)
      }
    }

    if (!testSchoolId) {
      console.log('❌ No test school available - cannot continue')
      return
    }

    // Create test bursar
    console.log('\n3. Creating test bursar...')
    try {
      const bursarData = {
        firstname: 'Michael',
        lastname: 'Bursar',
        email: 'bursar@smart-s.com',
        password: 'password123',
        phone: '+1234567891',
        school: testSchoolId,
        regNo: 'BUR001'
      }

      const bursarResponse = await axios.post(`${BASE_URL}/user/bursar/create`, bursarData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      
      console.log('✅ Test bursar created successfully')
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Bursar already exists')
      } else {
        console.log('❌ Bursar creation failed:', error.response?.data?.message)
      }
    }

    // Create test principal
    console.log('\n4. Creating test principal...')
    try {
      const principalData = {
        firstname: 'Dr. Sarah',
        lastname: 'Principal',
        email: 'principal@smart-s.com',
        password: 'password123',
        phone: '+1234567892',
        school: testSchoolId,
        regNo: 'PRI001'
      }

      const principalResponse = await axios.post(`${BASE_URL}/user/principal/create`, principalData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      
      console.log('✅ Test principal created successfully')
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Principal already exists')
      } else {
        console.log('❌ Principal creation failed:', error.response?.data?.message)
      }
    }

    console.log('\n✅ Test user setup completed!')
    console.log('You can now run the access control tests.')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    if (error.response) {
      console.error('Response:', error.response.data)
    }
  }
}

// Run setup
setupTestUsers()
