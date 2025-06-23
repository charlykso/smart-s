const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function listAllResources() {
  try {
    console.log('Listing All Resources...\n')

    // Step 1: Login as Admin
    console.log('Logging in as Admin...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    const adminToken = loginResponse.data.data.token
    console.log('✅ Admin login successful\n')

    // Step 2: List all Group Schools
    console.log('=== GROUP SCHOOLS ===')
    try {
      const groupSchoolsResponse = await axios.get(
        `${BASE_URL}/groupSchool/all`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      )

      if (groupSchoolsResponse.data.groupSchools.length === 0) {
        console.log('No group schools found')
      } else {
        groupSchoolsResponse.data.groupSchools.forEach((gs, index) => {
          console.log(`${index + 1}. ${gs.name}`)
          console.log(`   ID: ${gs._id}`)
          console.log(`   Description: ${gs.description}`)
          console.log(
            `   Created: ${new Date(gs.createdAt).toLocaleDateString()}`
          )
        })
      }
    } catch (error) {
      console.log(
        'Error fetching group schools:',
        error.response?.data?.message
      )
    }

    // Step 3: List all Schools
    console.log('\n=== SCHOOLS ===')
    try {
      const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      if (schoolsResponse.data.schools.length === 0) {
        console.log('No schools found')
      } else {
        schoolsResponse.data.schools.forEach((school, index) => {
          console.log(`${index + 1}. ${school.name}`)
          console.log(`   ID: ${school._id}`)
          console.log(`   Email: ${school.email}`)
          console.log(`   Phone: ${school.phoneNumber}`)
          console.log(`   Address: ${school.address}`)
          console.log(`   Group School ID: ${school.groupSchool}`)
          console.log(`   Active: ${school.isActive}`)
          console.log(
            `   Created: ${new Date(school.createdAt).toLocaleDateString()}`
          )
        })
      }
    } catch (error) {
      console.log('Error fetching schools:', error.response?.data?.message)
    }

    // Step 4: List all ICT Admins
    console.log('\n=== ICT ADMINISTRATORS ===')
    try {
      const usersResponse = await axios.get(`${BASE_URL}/user/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      const ictAdmins = usersResponse.data.users.filter(
        (user) => user.roles && user.roles.includes('ICT_administrator')
      )

      if (ictAdmins.length === 0) {
        console.log('No ICT Administrators found')
      } else {
        ictAdmins.forEach((admin, index) => {
          console.log(`${index + 1}. ${admin.firstname} ${admin.lastname}`)
          console.log(`   Email: ${admin.email}`)
          console.log(`   Phone: ${admin.phone}`)
          console.log(`   Registration No: ${admin.regNo}`)
          console.log(`   School ID: ${admin.school}`)
          console.log(`   Gender: ${admin.gender}`)
          console.log(`   Type: ${admin.type}`)
          console.log(
            `   Created: ${new Date(admin.createdAt).toLocaleDateString()}`
          )
        })
      }
    } catch (error) {
      console.log('Error fetching users:', error.response?.data?.message)
    }

    console.log('\n✅ Resource listing completed')
  } catch (error) {
    console.error('\n❌ Resource listing failed:')
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

listAllResources()
