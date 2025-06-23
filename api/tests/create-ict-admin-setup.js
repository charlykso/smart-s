const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createICTAdminSetup() {
  try {
    console.log('Creating ICT Admin setup...\n')

    // Step 1: Login as Admin
    console.log('Step 1: Logging in as Admin...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    const adminToken = loginResponse.data.data.token
    console.log('Admin login successful!') // Step 2: Create a Group School
    console.log('\nStep 2: Creating a Group School...')
    const groupSchoolData = {
      name: 'Greenwood Educational Group',
      description: 'A leading educational group providing quality education',
      logo: 'https://via.placeholder.com/200x200.png?text=Greenwood',
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
      console.log(
        'Group School created:',
        groupSchoolResponse.data.groupSchool.name
      )
      groupSchoolId = groupSchoolResponse.data.groupSchool._id
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('Group School already exists, fetching existing one...')
        // Fetch existing group schools
        const existingResponse = await axios.get(
          `${BASE_URL}/groupSchool/all`,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }
        )
        const greenwood = existingResponse.data.groupSchools.find((gs) =>
          gs.name.toLowerCase().includes('greenwood')
        )
        if (greenwood) {
          groupSchoolId = greenwood._id
          console.log('Using existing Group School:', greenwood.name)
        } else {
          // Use the first available group school
          groupSchoolId = existingResponse.data.groupSchools[0]._id
          console.log(
            'Using first available Group School:',
            existingResponse.data.groupSchools[0].name
          )
        }
      } else {
        throw error
      }
    }

    // Step 3: Create a School under the Group School
    console.log('\nStep 3: Creating a school...')
    const schoolData = {
      name: 'Greenwood High School',
      email: 'contact@greenwood.edu',
      phoneNumber: '+1234567890',
      address: '123 Education Street, Learning City',
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
      if (error.response?.status === 409) {
        console.log('School already exists')
        schoolId = null
      } else {
        console.log('School creation error:', error.response?.data)
        schoolId = null
      }
    } // Step 4: Create ICT Admin user
    console.log('\nStep 4: Creating ICT Admin user...')
    const ictAdminData = {
      firstname: 'ICT',
      lastname: 'Administrator',
      email: 'ict@greenwood.edu',
      phone: '+1234567891',
      password: 'password123',
      roles: ['ICT_administrator'],
      type: 'day',
      gender: 'Male',
      regNo: 'ICT001',
      school: schoolId, // Associate with the school, not groupSchool directly
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
      console.log('ICT Admin created:', ictAdminResponse.data.user.email)
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ICT Admin user already exists')
      } else {
        console.log('ICT Admin creation error:', error.response?.data)
      }
    }

    // Step 5: Test ICT Admin login
    console.log('\nStep 5: Testing ICT Admin login...')
    const ictLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ict@greenwood.edu',
      password: 'password123',
    })

    console.log('ICT Admin login successful!')
    console.log('ICT Admin user:', {
      id: ictLoginResponse.data.data.user._id,
      email: ictLoginResponse.data.data.user.email,
      roles: ictLoginResponse.data.data.user.roles,
      school: ictLoginResponse.data.data.user.school,
    })

    console.log('\n✅ ICT Admin setup completed successfully!')
    console.log('\nCredentials:')
    console.log('Email: ict@greenwood.edu')
    console.log('Password: password123')
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

createICTAdminSetup()
