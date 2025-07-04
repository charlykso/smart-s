const axios = require('axios')
const BASE_URL = 'http://localhost:3000/api/v1'

async function testBursarSchoolBoundary() {
  try {
    console.log('🔍 TESTING BURSAR SCHOOL BOUNDARY ENFORCEMENT')
    console.log('='.repeat(55))

    // Login as Bursar
    const bursarLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bursar@smart-s.com',
      password: 'password123',
    })

    const bursarToken = bursarLogin.data.data.token
    const bursarUser = bursarLogin.data.data.user

    console.log('✅ Bursar logged in')
    console.log('User school:', bursarUser.school)
    console.log('User roles:', bursarUser.roles)

    // Check what school the user belongs to
    const userSchoolId = bursarUser.school?._id || bursarUser.school
    console.log('User school ID:', userSchoolId)

    // Try creating fee with user's school ID
    if (userSchoolId) {
      console.log("\n🧪 Testing fee creation with user's school ID...")
      const testFee = {
        name: `Test Fee ${Date.now()}`,
        decription: 'Test fee with user school ID',
        amount: 1000,
        school_id: userSchoolId,
        term_id: '6861594efcc6cbbde9566141',
        type: 'Test',
        isActive: true,
        isInstallmentAllowed: false,
        no_ofInstallments: 1,
        isApproved: false,
      }

      try {
        const response = await axios.post(`${BASE_URL}/fee/create`, testFee, {
          headers: { Authorization: `Bearer ${bursarToken}` },
        })
        console.log('✅ SUCCESS with user school ID!')
        console.log('Created fee:', response.data.name)
      } catch (error) {
        console.log(
          '❌ FAILED with user school ID:',
          error.response?.data?.message
        )
      }
    } else {
      console.log('⚠️ User has no school assignment!')
    }

    // Try with hardcoded Smart School Academy ID
    console.log('\n🧪 Testing with hardcoded Smart School Academy ID...')
    const smartSchoolId = '6856ca374de0e2d916dc329c'
    const testFee2 = {
      name: `Test Fee 2 ${Date.now()}`,
      decription: 'Test fee with hardcoded school ID',
      amount: 1000,
      school_id: smartSchoolId,
      term_id: '6861594efcc6cbbde9566141',
      type: 'Test',
      isActive: true,
      isInstallmentAllowed: false,
      no_ofInstallments: 1,
      isApproved: false,
    }

    try {
      const response2 = await axios.post(`${BASE_URL}/fee/create`, testFee2, {
        headers: { Authorization: `Bearer ${bursarToken}` },
      })
      console.log('✅ SUCCESS with hardcoded school ID!')
      console.log('Created fee:', response2.data.name)
    } catch (error) {
      console.log(
        '❌ FAILED with hardcoded school ID:',
        error.response?.data?.message
      )
    }

    // Check if user school matches Smart School Academy
    console.log('\n🔍 School ID comparison:')
    console.log('User school ID:', userSchoolId)
    console.log('Smart School Academy ID:', smartSchoolId)
    console.log('Match:', userSchoolId === smartSchoolId)
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testBursarSchoolBoundary()
