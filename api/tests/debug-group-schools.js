const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function debugGroupSchools() {
  try {
    console.log('Debugging Group Schools API...\n')

    // Step 1: Login as Admin
    console.log('Step 1: Logging in as Admin...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })

    const adminToken = loginResponse.data.data.token
    console.log('✅ Admin login successful!')

    // Step 2: Test Group Schools endpoint
    console.log('\nStep 2: Testing group schools endpoint...')
    try {
      const response = await axios.get(`${BASE_URL}/groupSchool/all`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      console.log('Response status:', response.status)
      console.log('Response data:', JSON.stringify(response.data, null, 2))
    } catch (error) {
      console.log('Error details:')
      console.log('Status:', error.response?.status)
      console.log('Data:', error.response?.data)
      console.log('Message:', error.message)
    }

    // Step 3: Test creating a simple group school
    console.log('\nStep 3: Testing group school creation...')
    try {
      const groupSchoolData = {
        name: 'Test Group School',
        description: 'A test group school',
        logo: 'https://via.placeholder.com/200x200.png?text=Test',
      }

      const createResponse = await axios.post(
        `${BASE_URL}/groupSchool/create`,
        groupSchoolData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('✅ Group school creation successful')
      console.log('Created:', createResponse.data)
    } catch (error) {
      console.log('Group school creation error:')
      console.log('Status:', error.response?.status)
      console.log('Data:', error.response?.data)
    }
  } catch (error) {
    console.error('Debug failed:', error.message)
  }
}

debugGroupSchools()
