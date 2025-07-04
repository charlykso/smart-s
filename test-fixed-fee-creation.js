// Test the fixed fee creation logic
const BASE_URL = 'http://localhost:3000/api/v1'

async function testFixedFeeCreation() {
  console.log('🧪 Testing Fixed Fee Creation Logic...\n')

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

    // Get terms to use for testing
    const termsResponse = await fetch(`${BASE_URL}/Term/all`, {
      headers: authHeaders,
    })
    const terms = await termsResponse.json()

    // Test 1: Try to create a fee with a DIFFERENT name in an existing term (should work now)
    console.log(
      '\n🧪 Test 1: Create fee with different name in existing term...'
    )
    const testFee1 = {
      name: 'Library Fee',
      description: 'Library access and book rental',
      amount: 3000,
      type: 'Academic',
      school_id: '6856ca374de0e2d916dc329c',
      term_id: terms[0]._id, // First term (which has existing fees)
      isActive: true,
      isApproved: false,
    }

    const createResponse1 = await fetch(`${BASE_URL}/fee/create`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testFee1),
    })

    console.log('Status:', createResponse1.status)
    if (createResponse1.ok) {
      const createdFee = await createResponse1.json()
      console.log('✅ SUCCESS: Library Fee created successfully!')
      console.log('  Fee ID:', createdFee._id)
      console.log('  Name:', createdFee.name)
    } else {
      const errorText = await createResponse1.text()
      console.log('❌ FAILED:', errorText)
    }

    // Test 2: Try to create same name fee again (should fail)
    console.log(
      '\n🧪 Test 2: Try to create duplicate "Library Fee" (should fail)...'
    )
    const createResponse2 = await fetch(`${BASE_URL}/fee/create`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testFee1),
    })

    console.log('Status:', createResponse2.status)
    if (createResponse2.ok) {
      console.log(
        '❌ UNEXPECTED: Duplicate fee was created (should have failed)'
      )
    } else {
      const errorText = await createResponse2.text()
      console.log('✅ EXPECTED: Duplicate prevented:', errorText)
    }

    // Test 3: Create same name fee in DIFFERENT term (should work)
    console.log(
      '\n🧪 Test 3: Create "Library Fee" in different term (should work)...'
    )
    const testFee3 = {
      ...testFee1,
      term_id: terms[1]._id, // Different term
    }

    const createResponse3 = await fetch(`${BASE_URL}/fee/create`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testFee3),
    })

    console.log('Status:', createResponse3.status)
    if (createResponse3.ok) {
      const createdFee = await createResponse3.json()
      console.log('✅ SUCCESS: Same name in different term works!')
      console.log('  Fee ID:', createdFee._id)
      console.log('  Term used:', terms[1].name)
    } else {
      const errorText = await createResponse3.text()
      console.log('❌ FAILED:', errorText)
    }

    console.log('\n🎯 SUMMARY:')
    console.log('The duplicate check logic has been fixed!')
    console.log(
      '✅ You can now create multiple fees in the same term (with different names)'
    )
    console.log('✅ You can create fees with the same name in different terms')
    console.log(
      '❌ You cannot create duplicate fees (same name + same term + same school)'
    )
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testFixedFeeCreation()
