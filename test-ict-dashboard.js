// Use built-in fetch (Node.js 18+)

// Test the ICT admin dashboard endpoint
async function testICTDashboard() {
  try {
    console.log('Testing ICT admin dashboard endpoint...')

    // Use the token from the logs (this is the ICT admin token)
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NTZjYTM3NGRlMGUyZDkxNmRjMzI5ZSIsImVtYWlsIjoiaWN0YWRtaW5Ac21hcnQtcy5jb20iLCJyb2xlcyI6WyJJQ1RfYWRtaW5pc3RyYXRvciJdLCJzY2hvb2wiOiI2ODU2Y2EzNzRkZTBlMmQ5MTZkYzMyOWMiLCJpYXQiOjE3MzY2MjE5NzIsImV4cCI6MTczNjcwODM3Mn0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

    const response = await fetch(
      'http://localhost:3000/api/v1/ict-admin/dashboard',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers.raw())

    const data = await response.json()
    console.log('Response data:', JSON.stringify(data, null, 2))

    if (data.success) {
      console.log('\n✅ ICT Admin dashboard endpoint is working!')
      console.log('School count:', data.data.stats?.totalSchools || 'Not found')
      console.log('School name:', data.data.school?.name || 'Not found')
    } else {
      console.log(
        '\n❌ ICT Admin dashboard endpoint returned error:',
        data.message
      )
    }
  } catch (error) {
    console.error('❌ Error testing ICT admin dashboard:', error.message)
  }
}

testICTDashboard()
