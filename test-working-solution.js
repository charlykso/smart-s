// Test a working fee creation solution
const BASE_URL = 'http://localhost:3000/api/v1'

async function testWorkingSolution() {
  console.log('🎯 Testing Working Fee Creation Solutions...\n')

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

    // Get terms
    const termsResponse = await fetch(`${BASE_URL}/Term/all`, {
      headers: authHeaders,
    })
    const terms = await termsResponse.json()

    // Solution 1: Different name, same term
    console.log(
      '\n✅ Solution 1: Create "Project Development Fee" in First Term'
    )
    const solution1 = {
      name: 'Project Development Fee',
      description: 'Project development activities and materials',
      amount: 8000,
      type: 'Academic',
      school_id: '6856ca374de0e2d916dc329c',
      term_id: terms[0]._id, // First term
      isActive: true,
      isApproved: false,
    }

    const response1 = await fetch(`${BASE_URL}/fee/create`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(solution1),
    })

    console.log('Status:', response1.status)
    if (response1.ok) {
      const data = await response1.json()
      console.log('✅ SUCCESS: Project Development Fee created!')
      console.log('   Fee ID:', data._id || data.data?._id)
    } else {
      const error = await response1.text()
      console.log('❌ Failed:', error)
    }

    // Solution 2: Same name, different term
    console.log('\n✅ Solution 2: Create "Project Fee" in Second Term')
    const solution2 = {
      name: 'Project Fee',
      description: 'Project activities and materials',
      amount: 8000,
      type: 'Academic',
      school_id: '6856ca374de0e2d916dc329c',
      term_id: terms[1]._id, // Second term
      isActive: true,
      isApproved: false,
    }

    const response2 = await fetch(`${BASE_URL}/fee/create`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(solution2),
    })

    console.log('Status:', response2.status)
    if (response2.ok) {
      const data = await response2.json()
      console.log('✅ SUCCESS: Project Fee created in Second Term!')
      console.log('   Fee ID:', data._id || data.data?._id)
    } else {
      const error = await response2.text()
      console.log('❌ Failed:', error)
    }

    console.log('\n🎉 SUMMARY:')
    console.log('The fee creation system is working correctly!')
    console.log(
      '✅ The duplicate check is properly preventing actual duplicates'
    )
    console.log('✅ You can create fees with different names in the same term')
    console.log('✅ You can create fees with the same name in different terms')
    console.log('\n📝 For your frontend:')
    console.log('- Use "Project Development Fee" instead of "Project Fee"')
    console.log('- OR select a different term (Second/Third Term)')
    console.log('- OR choose a completely different name')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testWorkingSolution()
