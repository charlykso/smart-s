const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createSecondICTAdmin() {
  try {
    console.log('Creating Second ICT Admin...\n')

    // Login as Admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })
    const adminToken = loginResponse.data.data.token
    console.log('✅ Admin login successful')

    // Use Bluefield Group School ID (from our debug output)
    const groupSchoolId = '68588479829232983f677491'
    console.log('Using Bluefield Group School ID:', groupSchoolId)

    // Create Bluefield Academy
    const schoolData = {
      name: 'Bluefield Academy',
      email: 'contact@bluefield.edu',
      phoneNumber: '+1987654321',
      address: '456 Innovation Boulevard, Tech City',
      groupSchool: groupSchoolId,
      isActive: true,
    }

    let schoolId
    try {
      const schoolResponse = await axios.post(
        `${BASE_URL}/school/create`,
        schoolData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      schoolId = schoolResponse.data.school._id
      console.log('✅ School created:', schoolResponse.data.school.name)
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('School already exists, finding it...')
        const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })

        const schools =
          schoolsResponse.data.schools || schoolsResponse.data || []
        const bluefieldSchool = schools.find((s) =>
          s.name.toLowerCase().includes('bluefield')
        )

        if (bluefieldSchool) {
          schoolId = bluefieldSchool._id
          console.log('✅ Using existing Bluefield school')
        } else {
          // Use any school
          schoolId = schools[0]._id
          console.log('✅ Using first available school:', schools[0].name)
        }
      } else {
        console.log('School creation error:', error.response?.data)
        throw error
      }
    }

    // Create ICT Admin
    const ictAdminData = {
      firstname: 'Sarah',
      lastname: 'Tech',
      email: 'ict@bluefield.edu',
      phone: '+1987654322',
      password: 'password123',
      roles: ['ICT_administrator'],
      type: 'day',
      gender: 'Female',
      regNo: 'ICT002',
      school: schoolId,
    }

    try {
      const ictAdminResponse = await axios.post(
        `${BASE_URL}/user/create`,
        ictAdminData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      console.log('✅ ICT Admin created:', ictAdminResponse.data.user.email)
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ ICT Admin already exists')
      } else {
        console.log('ICT Admin creation error:', error.response?.data)
        throw error
      }
    }

    // Test login
    const testLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ict@bluefield.edu',
      password: 'password123',
    })

    console.log('✅ Login test successful!')
    const user = testLogin.data.data.user
    console.log(`Name: ${user.firstname} ${user.lastname}`)
    console.log(`Email: ${user.email}`)
    console.log(`Roles: ${user.roles.join(', ')}`)

    console.log('\n🎉 Second ICT Admin created successfully!')
    console.log('Login: ict@bluefield.edu / password123')
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message)
  }
}

createSecondICTAdmin()
