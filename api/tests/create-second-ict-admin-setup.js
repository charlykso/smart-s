const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createSecondICTAdminSetup() {
  try {
    console.log('Creating Second ICT Admin setup...\n')

    // Step 1: Login as Admin
    console.log('Step 1: Logging in as Admin...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    const adminToken = loginResponse.data.data.token
    console.log('Admin login successful!')

    // Step 2: Create a Second Group School
    console.log('\nStep 2: Creating a Second Group School...')
    const groupSchoolData = {
      name: 'Bluefield Educational Network',
      description: 'Premium educational network focused on innovative learning',
      logo: 'https://via.placeholder.com/200x200.png?text=Bluefield',
    }    let groupSchoolId
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
        groupSchoolResponse.data.data.name
      )
      groupSchoolId = groupSchoolResponse.data.data._id
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
        console.log('Group schools response:', existingResponse.data)
        
        // The response is a flat array, not wrapped in .groupSchools
        const groupSchools = Array.isArray(existingResponse.data) ? existingResponse.data : []
        
        if (groupSchools.length > 0) {
          const bluefield = groupSchools.find((gs) =>
            gs.name.toLowerCase().includes('bluefield')
          )
          if (bluefield) {
            groupSchoolId = bluefield._id
            console.log('Using existing Group School:', bluefield.name)
          } else {
            // Use the second available group school or create one anyway
            if (groupSchools.length > 1) {
              groupSchoolId = groupSchools[1]._id
              console.log(
                'Using second available Group School:',
                groupSchools[1].name
              )
            } else {
              console.log('Creating new group school since Bluefield not found...')
              // Force create by rethrowing the original error
              throw error
            }
          }
        } else {
          console.log('No group schools data in response, will create new one')
          throw error
        }
      } else {
        throw error
      }
    }

    // Step 3: Create a School under the Second Group School
    console.log('\nStep 3: Creating a school under Bluefield...')
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
      if (error.response?.status === 409) {
        console.log('School already exists, fetching existing school...')
        // Try to find the existing school
        const schoolsResponse = await axios.get(
          `${BASE_URL}/school/all`,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }
        )
        const bluefieldSchool = schoolsResponse.data.schools.find((school) =>
          school.name.toLowerCase().includes('bluefield')
        )
        if (bluefieldSchool) {
          schoolId = bluefieldSchool._id
          console.log('Using existing school:', bluefieldSchool.name)
        } else {
          throw new Error('Could not find or create Bluefield school')
        }
      } else {
        console.log('School creation error:', error.response?.data)
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
      school: schoolId, // Associate with the Bluefield school
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
      if (error.response?.status === 409) {
        console.log('Second ICT Admin user already exists')
      } else {
        console.log('Second ICT Admin creation error:', error.response?.data)
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
    console.log('Second ICT Admin user:', {
      id: ictLoginResponse.data.data.user._id,
      email: ictLoginResponse.data.data.user.email,
      roles: ictLoginResponse.data.data.user.roles,
      school: ictLoginResponse.data.data.user.school,
    })

    // Step 6: Test ICT Admin endpoints
    console.log('\nStep 6: Testing Second ICT Admin endpoints...')
    const ictToken = ictLoginResponse.data.data.token

    try {
      // Test managed schools endpoint
      const managedSchoolsResponse = await axios.get(
        `${BASE_URL}/users/managed-schools`,
        {
          headers: {
            Authorization: `Bearer ${ictToken}`,
          },
        }
      )
      console.log('Managed Schools:', managedSchoolsResponse.data.schools.map(s => s.name))
    } catch (error) {
      console.log('Managed schools endpoint error:', error.response?.data)
    }

    try {
      // Test schools by group endpoint
      const schoolsByGroupResponse = await axios.get(
        `${BASE_URL}/schools/by-group`,
        {
          headers: {
            Authorization: `Bearer ${ictToken}`,
          },
        }
      )
      console.log('Schools by Group:', schoolsByGroupResponse.data.schools.map(s => s.name))
    } catch (error) {
      console.log('Schools by group endpoint error:', error.response?.data)
    }

    try {
      // Test template download endpoint
      const templateResponse = await axios.get(
        `${BASE_URL}/bulk-students/template`,
        {
          headers: {
            Authorization: `Bearer ${ictToken}`,
          },
        }
      )
      console.log('Template download successful:', templateResponse.status === 200)
    } catch (error) {
      console.log('Template download error:', error.response?.data)
    }

    console.log('\n✅ Second ICT Admin setup completed successfully!')
    console.log('\nSecond ICT Admin Credentials:')
    console.log('Group School: Bluefield Educational Network')
    console.log('School: Bluefield Academy')
    console.log('Email: ict@bluefield.edu')
    console.log('Password: password123')
    console.log('Name: Sarah Tech')

    console.log('\n📋 Summary of all ICT Admins:')
    console.log('1. ICT Admin - Greenwood Educational Group')
    console.log('   - Email: ict@greenwood.edu')
    console.log('   - School: Greenwood High School')
    console.log('2. ICT Admin - Bluefield Educational Network')
    console.log('   - Email: ict@bluefield.edu')
    console.log('   - School: Bluefield Academy')

  } catch (error) {
    console.error('\n❌ Second ICT Admin setup failed:')
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

createSecondICTAdminSetup()
