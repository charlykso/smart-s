const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function checkSystemUsers() {
  console.log('🔍 Checking existing users in the system...\n')
  
  // Test various common admin credentials
  const testCredentials = [
    { email: 'admin@smart-s.com', password: 'password123' },
    { email: 'admin@system.com', password: 'password123' },
    { email: 'admin@example.com', password: 'password123' },
    { email: 'admin', password: 'admin' },
    { email: 'admin', password: 'password123' }
  ]

  for (const creds of testCredentials) {
    try {
      console.log(`Testing login: ${creds.email}`)
      const response = await axios.post(`${BASE_URL}/auth/login`, creds)
      
      if (response.data.success) {
        console.log('✅ Login successful!')
        console.log('User data:', JSON.stringify(response.data.data.user, null, 2))
        
        // Try to get all users if this is an admin
        const token = response.data.data.token
        try {
          const usersResponse = await axios.get(`${BASE_URL}/user/all`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          console.log('\n📋 Existing users in system:')
          usersResponse.data.forEach(user => {
            console.log(`- ${user.firstname} ${user.lastname} (${user.email}) - Roles: ${user.roles?.join(', ') || 'No roles'}`)
          })
          
        } catch (err) {
          console.log('ℹ️ Could not fetch users list (might not have permission)')
        }
        return
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}`)
    }
  }
  
  console.log('\n❌ No working admin credentials found.')
  console.log('You may need to:')
  console.log('1. Create an admin user manually through the database/application')
  console.log('2. Check if the server is properly connected to the database')
  console.log('3. Run any initial setup/seed scripts if they exist')
}

checkSystemUsers()
