// Test the fixed fee creation response format
const BASE_URL = 'http://localhost:3000/api/v1'

async function testFixedFeeResponse() {
  console.log('🧪 Testing Fixed Fee Creation Response Format...\n')

  try {
    // Login as Bursar
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bursar@smart-s.com',
        password: 'password123',
      }),
    })

    const loginData = await loginResponse.json()
    const token = loginData.data.token
    console.log('✅ Bursar login successful')

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    // Get a term to use
    const termsResponse = await fetch(`${BASE_URL}/Term/all`, {
      headers: authHeaders,
    })
    const terms = await termsResponse.json()

    // Test creating a fee with the fixed response format
    console.log('\n🧪 Testing fee creation with fixed response format...')
    const testFee = {
      name: 'Test Response Fee',
      description: 'Testing the fixed response format',
      amount: 7500,
      type: 'Test',
      school_id: '6856ca374de0e2d916dc329c',
      term_id: terms[0]._id,
      isActive: true,
      isApproved: false,
    }

    const createResponse = await fetch(`${BASE_URL}/fee/create`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testFee),
    })

    console.log(`\n📡 Response Status: ${createResponse.status}`)

    if (createResponse.ok) {
      const responseData = await createResponse.json()
      console.log('✅ SUCCESS: Fee creation response:')
      console.log(JSON.stringify(responseData, null, 2))

      // Check if response has the expected format
      if (responseData.success && responseData.data && responseData.message) {
        console.log(
          '\n🎯 PERFECT! Response format matches frontend expectations:'
        )
        console.log('  ✅ Has success property:', responseData.success)
        console.log('  ✅ Has data property:', !!responseData.data)
        console.log('  ✅ Has message property:', responseData.message)
        console.log('  ✅ Fee ID:', responseData.data._id)
        console.log('\n🚀 The frontend should now work correctly!')
      } else {
        console.log('\n❌ Response format still incorrect!')
      }
    } else {
      const errorText = await createResponse.text()
      console.log('❌ FAILED:', errorText)
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testFixedFeeResponse()
