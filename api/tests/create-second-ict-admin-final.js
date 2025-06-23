const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createSecondICTAdminFinal() {
  try {
    console.log('Creating Second ICT Admin - Final Version...\n')

    // Step 1: Login as Admin
    console.log('Step 1: Logging in as Admin...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    const adminToken = loginResponse.data.data.token
    console.log('Admin login successful!')

    // Step 2: Get the Bluefield Group School ID
    console.log('\nStep 2: Finding Bluefield Group School...')
    const groupSchoolsResponse = await axios.get(
      `${BASE_URL}/groupSchool/all`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    )

    const groupSchools = Array.isArray(groupSchoolsResponse.data)
      ? groupSchoolsResponse.data
      : []
    const bluefieldGroup = groupSchools.find((gs) =>
      gs.name.toLowerCase().includes('bluefield')
    )

    if (!bluefieldGroup) {
      throw new Error('Bluefield Educational Network not found')
    }

    const groupSchoolId = bluefieldGroup._id
    console.log('Found Bluefield Group School:', bluefieldGroup.name)
    console.log('Group School ID:', groupSchoolId)

    // Step 3: Create a School under the Bluefield Group School
    console.log('\nStep 3: Creating Bluefield Academy...')
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
      console.log('School created:', schoolResponse.data.school.name)
      schoolId = schoolResponse.data.school._id
    } catch (error) {
      console.log('School creation error details:')
      console.log('Status:', error.response?.status)
      console.log('Data:', error.response?.data)

      if (error.response?.status === 409) {
        console.log('School already exists, trying to find it...')
        // Try to find the existing school
        const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })

        console.log('Schools response:', schoolsResponse.data)
        const schools =
          schoolsResponse.data.schools || schoolsResponse.data || []
        const bluefieldSchool = schools.find((school) =>
          school.name.toLowerCase().includes('bluefield')
        )
        if (bluefieldSchool) {
          schoolId = bluefieldSchool._id
          console.log('Using existing school:', bluefieldSchool.name)
        } else {
          throw new Error('Could not find existing Bluefield school')
        }
      } else {
        throw error
      }
    }

    // Step 4: Create Second ICT Admin user
    console.log('\nStep 4: Creating Second ICT Admin user...')
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
      console.log('Second ICT Admin created:', ictAdminResponse.data.user.email)
    } catch (error) {
      console.log('ICT Admin creation error:')
      console.log('Status:', error.response?.status)
      console.log('Data:', error.response?.data)

      if (error.response?.status === 409) {
        console.log('Second ICT Admin user already exists')
      } else {
        throw error
      }
    }

    // Step 5: Test Second ICT Admin login
    console.log('\nStep 5: Testing Second ICT Admin login...')
    const ictLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ict@bluefield.edu',
      password: 'password123',
    })

    console.log('Second ICT Admin login successful!')
    const user = ictLoginResponse.data.data.user
    const token = ictLoginResponse.data.data.token

    console.log('User Details:')
    console.log(`- Name: ${user.firstname} ${user.lastname}`)
    console.log(`- Email: ${user.email}`)
    console.log(`- Roles: ${user.roles.join(', ')}`)
    console.log(`- School ID: ${user.school}`)

    // Step 6: Test ICT Admin endpoints
    console.log('\nStep 6: Testing Second ICT Admin endpoints...')

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

    console.log('\n✅ Second ICT Admin setup completed successfully!')
    console.log('\n📋 Credentials for Second ICT Admin:')
    console.log('Email: ict@bluefield.edu')
    console.log('Password: password123')
    console.log('Name: Sarah Tech')
    console.log('School: Bluefield Academy')
    console.log('Group: Bluefield Educational Network')
  } catch (error) {
    console.error('\n❌ Setup failed:')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error(
        'Message:',
        error.response.data?.message || error.response.data
      )
    } else {
      console.error('Error:', error.message)
    }
  }
}

createSecondICTAdminFinal()
