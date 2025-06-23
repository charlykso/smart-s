const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function debugSchools() {
  try {
    // Login as Admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ledgrio.com',
      password: 'password123',
    })
    const adminToken = loginResponse.data.data.token
    console.log('✅ Admin logged in')

    // Get schools
    const schoolsResponse = await axios.get(`${BASE_URL}/school/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    console.log(
      'Schools response:',
      JSON.stringify(schoolsResponse.data, null, 2)
    )
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message)
  }
}

debugSchools()
