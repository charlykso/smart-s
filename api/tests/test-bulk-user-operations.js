const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testBulkUserOperations() {
  try {
    console.log('🧪 TESTING BULK USER OPERATIONS')
    console.log('='.repeat(50))

    // Login as ICT Admin
    console.log('Step 1: Logging in as ICT Admin...')
    const ictLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ictadmin@smart-s.com',
      password: 'password123',
    })

    const ictToken = ictLogin.data.data.token
    const ictUser = ictLogin.data.data.user

    console.log('✅ ICT Admin logged in successfully')
    console.log('User school:', ictUser.school?.name || 'No school')
    console.log('User roles:', ictUser.roles)

    // Get users list
    console.log('\nStep 2: Getting users list...')
    const usersResponse = await axios.get(`${BASE_URL}/school-access/users`, {
      headers: { Authorization: `Bearer ${ictToken}` },
    })

    const users = usersResponse.data.data?.users || []
    console.log(`✅ Retrieved ${users.length} users`)
    console.log('Response structure:', Object.keys(usersResponse.data))
    console.log('Data structure:', Object.keys(usersResponse.data.data || {}))

    if (!Array.isArray(users)) {
      console.log('❌ Users data is not an array:', typeof users)
      console.log('Actual users data:', users)
      return
    }

    // Find some test users (students) to test bulk operations
    const testUsers = users
      .filter(
        (user) =>
          user.roles.includes('Student') &&
          user.email !== 'ictadmin@smart-s.com'
      )
      .slice(0, 2) // Take first 2 students

    if (testUsers.length === 0) {
      console.log('❌ No test users found for bulk operations')
      return
    }

    console.log(`Found ${testUsers.length} test users:`)
    testUsers.forEach((user) => {
      console.log(`  - ${user.firstname} ${user.lastname} (${user.email})`)
    })

    const testUserIds = testUsers.map((user) => user._id || user.id)

    // Test 1: Bulk Update (Deactivate)
    console.log('\nStep 3: Testing bulk update (deactivate)...')
    try {
      const bulkUpdateResponse = await axios.post(
        `${BASE_URL}/user/bulk-update`,
        {
          userIds: testUserIds,
          updates: { status: 'inactive' },
        },
        {
          headers: { Authorization: `Bearer ${ictToken}` },
        }
      )

      console.log('✅ Bulk update successful!')
      console.log('Response:', bulkUpdateResponse.data.message)
    } catch (error) {
      console.log(
        '❌ Bulk update failed:',
        error.response?.data?.message || error.message
      )
    }

    // Test 2: Bulk Update (Reactivate)
    console.log('\nStep 4: Testing bulk update (reactivate)...')
    try {
      const bulkUpdateResponse = await axios.post(
        `${BASE_URL}/user/bulk-update`,
        {
          userIds: testUserIds,
          updates: { status: 'active' },
        },
        {
          headers: { Authorization: `Bearer ${ictToken}` },
        }
      )

      console.log('✅ Bulk reactivate successful!')
      console.log('Response:', bulkUpdateResponse.data.message)
    } catch (error) {
      console.log(
        '❌ Bulk reactivate failed:',
        error.response?.data?.message || error.message
      )
    }

    // Test 3: Bulk Delete (This should work now)
    console.log('\nStep 5: Testing bulk delete...')
    try {
      const bulkDeleteResponse = await axios.post(
        `${BASE_URL}/user/bulk-delete`,
        {
          userIds: testUserIds,
        },
        {
          headers: { Authorization: `Bearer ${ictToken}` },
        }
      )

      console.log('✅ Bulk delete successful!')
      console.log('Response:', bulkDeleteResponse.data.message)
    } catch (error) {
      console.log(
        '❌ Bulk delete failed:',
        error.response?.data?.message || error.message
      )
      console.log('Error details:', error.response?.data)
    }

    console.log('\n🎯 BULK USER OPERATIONS TEST COMPLETED')
  } catch (error) {
    console.error(
      '❌ Test failed:',
      error.response?.data?.message || error.message
    )
  }
}

// Run the test
testBulkUserOperations()
