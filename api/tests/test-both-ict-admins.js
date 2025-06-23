const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testBothICTAdmins() {
  try {
    console.log('Testing Both ICT Admins...\n')

    // ICT Admin 1: Greenwood
    console.log('=== Testing ICT Admin 1: Greenwood ===')
    const ict1LoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ict@greenwood.edu',
      password: 'password123',
    })

    const ict1Token = ict1LoginResponse.data.data.token
    console.log('✅ ICT Admin 1 login successful')
    console.log('User:', {
      name: `${ict1LoginResponse.data.data.user.firstname} ${ict1LoginResponse.data.data.user.lastname}`,
      email: ict1LoginResponse.data.data.user.email,
      roles: ict1LoginResponse.data.data.user.roles,
    })

    // Test ICT Admin 1 endpoints
    try {
      const managedSchools1 = await axios.get(
        `${BASE_URL}/users/managed-schools`,
        {
          headers: { Authorization: `Bearer ${ict1Token}` },
        }
      )
      console.log(
        'ICT Admin 1 Managed Schools:',
        managedSchools1.data.schools.map((s) => s.name)
      )
    } catch (error) {
      console.log(
        'ICT Admin 1 managed schools error:',
        error.response?.data?.message
      )
    }

    try {
      const schoolsByGroup1 = await axios.get(`${BASE_URL}/schools/by-group`, {
        headers: { Authorization: `Bearer ${ict1Token}` },
      })
      console.log(
        'ICT Admin 1 Schools by Group:',
        schoolsByGroup1.data.schools.map((s) => s.name)
      )
    } catch (error) {
      console.log(
        'ICT Admin 1 schools by group error:',
        error.response?.data?.message
      )
    }

    // ICT Admin 2: Bluefield
    console.log('\n=== Testing ICT Admin 2: Bluefield ===')
    const ict2LoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ict@bluefield.edu',
      password: 'password123',
    })

    const ict2Token = ict2LoginResponse.data.data.token
    console.log('✅ ICT Admin 2 login successful')
    console.log('User:', {
      name: `${ict2LoginResponse.data.data.user.firstname} ${ict2LoginResponse.data.data.user.lastname}`,
      email: ict2LoginResponse.data.data.user.email,
      roles: ict2LoginResponse.data.data.user.roles,
    })

    // Test ICT Admin 2 endpoints
    try {
      const managedSchools2 = await axios.get(
        `${BASE_URL}/users/managed-schools`,
        {
          headers: { Authorization: `Bearer ${ict2Token}` },
        }
      )
      console.log(
        'ICT Admin 2 Managed Schools:',
        managedSchools2.data.schools.map((s) => s.name)
      )
    } catch (error) {
      console.log(
        'ICT Admin 2 managed schools error:',
        error.response?.data?.message
      )
    }

    try {
      const schoolsByGroup2 = await axios.get(`${BASE_URL}/schools/by-group`, {
        headers: { Authorization: `Bearer ${ict2Token}` },
      })
      console.log(
        'ICT Admin 2 Schools by Group:',
        schoolsByGroup2.data.schools.map((s) => s.name)
      )
    } catch (error) {
      console.log(
        'ICT Admin 2 schools by group error:',
        error.response?.data?.message
      )
    }

    // Test template downloads for both
    console.log('\n=== Testing Template Downloads ===')
    try {
      await axios.get(`${BASE_URL}/bulk-students/template`, {
        headers: { Authorization: `Bearer ${ict1Token}` },
      })
      console.log('✅ ICT Admin 1 template download successful')
    } catch (error) {
      console.log(
        '❌ ICT Admin 1 template download failed:',
        error.response?.data?.message
      )
    }

    try {
      await axios.get(`${BASE_URL}/bulk-students/template`, {
        headers: { Authorization: `Bearer ${ict2Token}` },
      })
      console.log('✅ ICT Admin 2 template download successful')
    } catch (error) {
      console.log(
        '❌ ICT Admin 2 template download failed:',
        error.response?.data?.message
      )
    }

    // Cross-access test (ICT Admin 1 shouldn't see ICT Admin 2's schools and vice versa)
    console.log('\n=== Testing Access Isolation ===')
    console.log('Verifying that ICT Admins only see their own group schools...')

    const schools1 = await axios.get(`${BASE_URL}/users/managed-schools`, {
      headers: { Authorization: `Bearer ${ict1Token}` },
    })

    const schools2 = await axios.get(`${BASE_URL}/users/managed-schools`, {
      headers: { Authorization: `Bearer ${ict2Token}` },
    })

    const ict1SchoolNames = schools1.data.schools.map((s) => s.name)
    const ict2SchoolNames = schools2.data.schools.map((s) => s.name)

    console.log('ICT Admin 1 can see:', ict1SchoolNames)
    console.log('ICT Admin 2 can see:', ict2SchoolNames)

    // Check if there's any overlap (there shouldn't be)
    const overlap = ict1SchoolNames.filter((name) =>
      ict2SchoolNames.includes(name)
    )
    if (overlap.length === 0) {
      console.log('✅ Perfect isolation - no school overlap between ICT Admins')
    } else {
      console.log('⚠️  Potential issue - school overlap detected:', overlap)
    }

    console.log('\n✅ Both ICT Admins test completed successfully!')
  } catch (error) {
    console.error('\n❌ Test failed:')
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

testBothICTAdmins()
