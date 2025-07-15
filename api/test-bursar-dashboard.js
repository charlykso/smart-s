const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

async function testBursarDashboard() {
  console.log('🔍 Testing Bursar Dashboard...\n')

  try {
    // First, let's check if there are any bursars in the system
    console.log('1. Checking for bursar users...')

    // We need to login as an admin first to check users
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@smart-s.com',
      password: 'password123',
    })

    if (!adminLogin.data.success) {
      console.log('❌ Admin login failed')
      return
    }

    const adminToken = adminLogin.data.data.token
    const adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    }

    // Check for bursar users
    const usersResponse = await axios.get(`${API_BASE}/user/all`, {
      headers: adminHeaders,
    })
    console.log(
      'Users response structure:',
      typeof usersResponse.data,
      Array.isArray(usersResponse.data)
    )

    const users = Array.isArray(usersResponse.data)
      ? usersResponse.data
      : usersResponse.data.data || []
    const bursars = users.filter(
      (user) => user.roles && user.roles.includes('Bursar')
    )

    console.log(`✅ Found ${bursars.length} bursar(s)`)
    bursars.forEach((bursar, index) => {
      console.log(
        `   ${index + 1}. ${bursar.firstname} ${bursar.lastname} - ${
          bursar.email
        }`
      )
      console.log(
        `      School: ${bursar.school?.name || 'No school assigned'}`
      )
    })

    if (bursars.length === 0) {
      console.log('❌ No bursars found in the system')
      return
    }

    // Try to login as the first bursar
    const bursar = bursars[0]
    console.log(`\n2. Testing login as bursar: ${bursar.email}`)

    try {
      const bursarLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: bursar.email,
        password: 'password123',
      })

      if (!bursarLogin.data.success) {
        console.log('❌ Bursar login failed - trying different password')
        return
      }

      const bursarToken = bursarLogin.data.data.token
      const bursarHeaders = {
        Authorization: `Bearer ${bursarToken}`,
        'Content-Type': 'application/json',
      }

      console.log('✅ Bursar login successful')

      // Test bursar dashboard
      console.log('\n3. Testing bursar dashboard...')
      const dashboardResponse = await axios.get(
        `${API_BASE}/bursar/dashboard`,
        { headers: bursarHeaders }
      )

      if (dashboardResponse.data.success) {
        console.log('✅ Bursar dashboard loaded successfully')
        const data = dashboardResponse.data.data

        console.log('\nDashboard Data:')
        console.log('- Bursar:', data.bursar.firstname, data.bursar.lastname)
        console.log('- School:', data.school?.name || 'No school')
        console.log('- Financial Stats:')
        console.log('  * Total Revenue:', data.financialStats.totalRevenue)
        console.log('  * Today Revenue:', data.financialStats.todayRevenue)
        console.log(
          '  * Pending Payments:',
          data.financialStats.pendingPayments
        )
        console.log(
          '  * Total Transactions:',
          data.financialStats.totalTransactions
        )
        console.log(
          '  * Outstanding Amount:',
          data.financialStats.outstandingAmount
        )
        console.log('- Recent Transactions:', data.recentTransactions.length)
        console.log('- Payment Methods:', data.paymentMethods.length)
        console.log('- Fee Collection Status:', data.feeCollectionStatus.length)

        // Check if there are any payments in the system
        console.log('\n4. Checking payment data...')
        const paymentsResponse = await axios.get(`${API_BASE}/payment/all`, {
          headers: bursarHeaders,
        })
        console.log('- Total payments in system:', paymentsResponse.data.length)

        // Check if there are any fees for this school
        console.log('\n5. Checking fee data...')
        const feesResponse = await axios.get(`${API_BASE}/fee/all`, {
          headers: bursarHeaders,
        })
        console.log('- Total fees for school:', feesResponse.data.length)
      } else {
        console.log(
          '❌ Bursar dashboard failed:',
          dashboardResponse.data.message
        )
      }
    } catch (loginError) {
      console.log(
        '❌ Bursar login failed:',
        loginError.response?.data?.message || loginError.message
      )
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

testBursarDashboard()
