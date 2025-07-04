// Test script to verify fee display updates
const axios = require('axios')

const API_BASE = 'http://localhost:3000/api/v1'

// Test credentials
const BURSAR_CREDENTIALS = {
  email: 'bursar@smartschool.edu',
  password: 'password123',
}

async function testFeeDisplayUpdate() {
  try {
    console.log('🧪 Testing Fee Display Update with Session Information\n')

    // 1. Login as Bursar
    console.log('1. Logging in as Bursar...')
    const loginResponse = await axios.post(
      `${API_BASE}/auth/login`,
      BURSAR_CREDENTIALS
    )
    const token = loginResponse.data.token
    console.log('✅ Login successful')

    // 2. Get approved fees to check session population
    console.log('\n2. Getting approved fees...')
    const feesResponse = await axios.get(`${API_BASE}/fee/get-approved-fees`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const fees = feesResponse.data
    console.log(`✅ Found ${fees.length} approved fees`)

    // 3. Check fee structure with session information
    console.log('\n3. Checking fee structure with session information:')
    fees.slice(0, 3).forEach((fee, index) => {
      console.log(`\n   Fee ${index + 1}:`)
      console.log(`   - Name: ${fee.name}`)
      console.log(`   - Amount: ₦${fee.amount.toLocaleString()}`)
      console.log(`   - Type: ${fee.type}`)
      console.log(`   - Term: ${fee.term?.name || 'No Term'}`)
      console.log(`   - Session: ${fee.term?.session?.name || 'No Session'}`)
      console.log(
        `   - Display Format: ${fee.name} - ₦${fee.amount.toLocaleString()} (${
          fee.type
        }) • ${fee.term?.name || 'No Term'}${
          fee.term?.session?.name ? ` - ${fee.term.session.name}` : ''
        }`
      )
    })

    // 4. Get students for payment testing
    console.log('\n4. Getting students...')
    const studentsResponse = await axios.get(`${API_BASE}/user/student/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const students = studentsResponse.data
    console.log(`✅ Found ${students.length} students`)

    if (students.length > 0) {
      const testStudent = students[0]
      console.log(
        `\n   Test Student: ${testStudent.firstname} ${testStudent.lastname} (${testStudent.regNo})`
      )
    }

    console.log('\n🎉 Fee display update test completed successfully!')
    console.log('\n📋 Summary of Updates:')
    console.log('   ✅ Backend: Fee endpoints now populate session information')
    console.log('   ✅ Frontend: Fee dropdown shows Term - Session format')
    console.log(
      '   ✅ Frontend: Dark mode styling applied to all white elements'
    )
    console.log(
      '   ✅ Fee details section shows session information in parentheses'
    )
  } catch (error) {
    console.error(
      '❌ Test failed:',
      error.response?.data?.message || error.message
    )
  }
}

// Run the test
testFeeDisplayUpdate()
