const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createProperSecondICTAdmin() {
  try {
    console.log('Creating Proper Second ICT Admin with Group School...\n')

    // Step 1: Login as Admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })
    const adminToken = loginResponse.data.data.token
    console.log('✅ Admin logged in')

    // Step 2: Create Bluefield Group School (or use existing)
    const groupSchoolData = {
      name: 'Bluefield Educational Network',
      description: 'Premium educational network focused on innovative learning',
      logo: 'https://via.placeholder.com/200x200.png?text=Bluefield',
    }

    let groupSchoolId
    try {
      const groupSchoolResponse = await axios.post(
        `${BASE_URL}/groupSchool/create`,
        groupSchoolData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      groupSchoolId = groupSchoolResponse.data.data._id
      console.log(
        '✅ Group School created:',
        groupSchoolResponse.data.data.name
      )
    } catch (error) {
      if (error.response?.status === 409) {
        // Get existing group schools
        const existingResponse = await axios.get(
          `${BASE_URL}/groupSchool/all`,
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          }
        )
        const groupSchools = Array.isArray(existingResponse.data)
          ? existingResponse.data
          : []
        const bluefield = groupSchools.find((gs) =>
          gs.name.toLowerCase().includes('bluefield')
        )
        if (bluefield) {
          groupSchoolId = bluefield._id
          console.log(
            '✅ Using existing Bluefield Group School:',
            bluefield.name
          )
        } else {
          throw new Error('Could not find or create Bluefield group school')
        }
      } else {
        throw error
      }
    }

    // Step 3: Create Bluefield Academy under the group school
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
        // Get existing schools and find Bluefield Academy
        const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })
        const schools = Array.isArray(schoolsResponse.data)
          ? schoolsResponse.data
          : []
        const bluefieldSchool = schools.find((s) =>
          s.name.toLowerCase().includes('bluefield')
        )
        if (bluefieldSchool) {
          schoolId = bluefieldSchool._id
          console.log(
            '✅ Using existing Bluefield Academy:',
            bluefieldSchool.name
          )
        } else {
          throw new Error('Could not find or create Bluefield Academy')
        }
      } else {
        console.log('School creation error:', error.response?.data)
        throw error
      }
    }

    // Step 4: Create Bluefield ICT Admin
    const ictAdminData = {
      firstname: 'Sarah',
      lastname: 'Tech',
      email: 'ict@bluefield.edu',
      phone: '+1987654322',
      password: 'password123',
      type: 'day',
      gender: 'Female',
      regNo: 'ICT002',
      school: schoolId,
    }

    try {
      const ictAdminResponse = await axios.post(
        `${BASE_URL}/user/ict-admin/create`,
        ictAdminData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      console.log('✅ Bluefield ICT Admin created successfully')
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Bluefield ICT Admin already exists')
      } else {
        console.log('ICT Admin creation error:', error.response?.data)
        throw error
      }
    }

    // Step 5: Test login and endpoints
    const testLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ict@bluefield.edu',
      password: 'password123',
    })

    console.log('✅ Bluefield ICT Admin login successful!')
    const user = testLogin.data.data.user
    const token = testLogin.data.data.token

    console.log('User Details:')
    console.log(`- Name: ${user.firstname} ${user.lastname}`)
    console.log(`- Email: ${user.email}`)
    console.log(`- School: ${user.school}`)

    // Test endpoints
    console.log('\nTesting ICT Admin endpoints...')

    try {
      const managedSchoolsResponse = await axios.get(
        `${BASE_URL}/users/managed-schools`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      console.log('✅ Managed Schools endpoint works')
      console.log(
        'Schools:',
        managedSchoolsResponse.data.schools.map((s) => s.name)
      )
    } catch (error) {
      console.log('❌ Managed schools error:', error.response?.data?.message)
    }

    try {
      const schoolsByGroupResponse = await axios.get(
        `${BASE_URL}/schools/by-group`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      console.log('✅ Schools by group endpoint works')
      console.log(
        'Schools:',
        schoolsByGroupResponse.data.schools.map((s) => s.name)
      )
    } catch (error) {
      console.log('❌ Schools by group error:', error.response?.data?.message)
    }

    try {
      await axios.get(`${BASE_URL}/bulk-students/template`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log('✅ Template download works')
    } catch (error) {
      console.log('❌ Template download error:', error.response?.data?.message)
    }

    console.log(
      '\n🎉 Second ICT Admin with proper group school setup completed!'
    )
    console.log('\n📋 ICT Admins Summary:')
    console.log('1. Greenwood ICT Admin: ict@greenwood.edu / password123')
    console.log('2. Bluefield ICT Admin: ict@bluefield.edu / password123')
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message)
  }
}

createProperSecondICTAdmin()
