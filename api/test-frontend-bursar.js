const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

async function testFrontendBursarFlow() {
  console.log('🔍 Testing Frontend Bursar Flow...\n')

  try {
    // Login as bursar
    console.log('1. Logging in as bursar...')
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'bursar@smartschool.edu',
      password: 'password123'
    })

    const authData = loginResponse.data.data
    const token = authData.token
    const user = authData.user

    console.log('✅ Login successful')
    console.log('- User:', user.firstname, user.lastname)
    console.log('- School:', user.school?.name)
    console.log('- Roles:', user.roles)

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    // Test bursar dashboard (simulating BursarService.getDashboardData)
    console.log('\n2. Testing bursar dashboard API...')
    const dashboardResponse = await axios.get(`${API_BASE}/bursar/dashboard`, { headers })
    
    // This simulates what ApiService.get returns
    const apiServiceResponse = dashboardResponse.data
    console.log('- ApiService response structure:', {
      success: apiServiceResponse.success,
      hasData: !!apiServiceResponse.data
    })

    // This simulates what BursarService.getDashboardData should return
    const bursarServiceResponse = apiServiceResponse.data
    console.log('- BursarService should return:', {
      bursar: bursarServiceResponse.bursar?.firstname,
      school: bursarServiceResponse.school?.name,
      totalRevenue: bursarServiceResponse.financialStats?.totalRevenue,
      todayRevenue: bursarServiceResponse.financialStats?.todayRevenue,
      pendingPayments: bursarServiceResponse.financialStats?.pendingPayments,
      totalTransactions: bursarServiceResponse.financialStats?.totalTransactions,
      outstandingAmount: bursarServiceResponse.financialStats?.outstandingAmount,
      recentTransactionsCount: bursarServiceResponse.recentTransactions?.length,
      paymentMethodsCount: bursarServiceResponse.paymentMethods?.length,
      feeCollectionStatusCount: bursarServiceResponse.feeCollectionStatus?.length
    })

    // Test payment profile access
    console.log('\n3. Testing payment profile access...')
    try {
      const profileResponse = await axios.get(`${API_BASE}/paymentProfile/all/${user.school._id}`, { headers })
      console.log('✅ Payment profile access successful')
      console.log('- Profiles found:', profileResponse.data.length)
    } catch (error) {
      console.log('❌ Payment profile access failed:', error.response?.status, error.response?.data?.message)
    }

    console.log('\n✅ Frontend bursar flow test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

testFrontendBursarFlow()
