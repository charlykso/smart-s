// Check what users are available in the system
const axios = require('axios')

;(async () => {
  console.log('👥 Checking Available Users...\n')

  try {
    // Login as ICT Admin first to get access
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'ictadmin@smart-s.com',
        password: 'password123',
      }
    )

    const token = loginResponse.data.data.token
    console.log('✅ ICT Admin Login Success')
    console.log('')

    const headers = { Authorization: `Bearer ${token}` }

    // Get all users - try different endpoints
    let usersResponse
    try {
      // Try the ICT admin managed users endpoint first
      usersResponse = await axios.get(
        'http://localhost:3000/api/v1/users/managed-schools',
        { headers }
      )
      console.log('✅ Using ICT Admin managed users endpoint')
    } catch (error) {
      try {
        // Try the general admin endpoint
        usersResponse = await axios.get(
          'http://localhost:3000/api/v1/user/all',
          { headers }
        )
        console.log('✅ Using general admin users endpoint')
      } catch (error2) {
        // Try getting users by role
        console.log(
          '❌ Both user endpoints failed, trying role-specific endpoints...'
        )

        // Get principals
        const principalsResponse = await axios.get(
          'http://localhost:3000/api/v1/user/principals/all',
          { headers }
        )
        console.log('✅ Principals endpoint works')

        // Get bursars
        const bursarsResponse = await axios.get(
          'http://localhost:3000/api/v1/user/bursars/all',
          { headers }
        )
        console.log('✅ Bursars endpoint works')

        // Get students
        const studentsResponse = await axios.get(
          'http://localhost:3000/api/v1/user/student/all',
          { headers }
        )
        console.log('✅ Students endpoint works')

        // Combine all users
        usersResponse = {
          data: {
            users: [
              ...principalsResponse.data.map((u) => ({
                ...u,
                roles: ['Principal'],
              })),
              ...bursarsResponse.data.map((u) => ({ ...u, roles: ['Bursar'] })),
              ...studentsResponse.data.map((u) => ({
                ...u,
                roles: ['Student'],
              })),
            ],
          },
        }
      }
    }
    console.log('📊 Available Users:')
    console.log(
      'Total users:',
      usersResponse.data.users?.length || usersResponse.data.length || 0
    )
    console.log('')

    const users = usersResponse.data.users || usersResponse.data || []

    // Group users by role
    const usersByRole = {}
    users.forEach((user) => {
      user.roles.forEach((role) => {
        if (!usersByRole[role]) usersByRole[role] = []
        usersByRole[role].push({
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          school: user.school?.name || 'No school',
        })
      })
    })

    // Display users by role
    Object.keys(usersByRole).forEach((role) => {
      console.log(`👤 ${role} Users (${usersByRole[role].length}):`)
      usersByRole[role].forEach((user) => {
        console.log(`   - ${user.name} (${user.email}) - ${user.school}`)
      })
      console.log('')
    })

    // Check specific roles we need for testing
    const requiredRoles = ['Principal', 'Bursar', 'Student']
    console.log('🔍 Required Roles Check:')

    requiredRoles.forEach((role) => {
      const roleUsers = usersByRole[role] || []
      if (roleUsers.length > 0) {
        console.log(`✅ ${role}: ${roleUsers.length} user(s) available`)
        console.log(`   First user: ${roleUsers[0].email}`)
      } else {
        console.log(`❌ ${role}: No users found`)
      }
    })
  } catch (error) {
    console.log(
      '❌ Check failed:',
      error.response?.data?.message || error.message
    )
  }
})()
