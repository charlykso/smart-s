// Helper script to resolve the Sport Fee conflict
const BASE_URL = 'http://localhost:3000/api/v1'

async function resolveSportFeeConflict() {
  console.log('🏃‍♂️ Resolving Sport Fee Conflict...\n')

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

    // Get current fees to see the conflict
    const feesResponse = await fetch(`${BASE_URL}/fee/all`, {
      headers: authHeaders,
    })
    const fees = await feesResponse.json()

    const sportFees = fees.filter((fee) =>
      fee.name.toLowerCase().includes('sport')
    )
    console.log(`\n📋 Existing Sport-related fees (${sportFees.length}):`)
    sportFees.forEach((fee) => {
      console.log(
        `  - "${fee.name}" in ${fee.term?.name || 'Unknown Term'} (ID: ${
          fee._id
        })`
      )
    })

    // Get terms for options
    const termsResponse = await fetch(`${BASE_URL}/Term/all`, {
      headers: authHeaders,
    })
    const terms = await termsResponse.json()

    console.log('\n🎯 SOLUTIONS for creating your Sport Fee:')
    console.log('='.repeat(50))

    console.log('\n✅ Option 1: Use a different name in any term')
    console.log('   Suggested names:')
    console.log('   - "Sports Fee"')
    console.log('   - "Athletic Fee"')
    console.log('   - "Physical Education Fee"')
    console.log('   - "Sports Activities Fee"')

    console.log('\n✅ Option 2: Use "Sport Fee" in a different term')
    console.log('   Available terms for "Sport Fee":')
    terms.forEach((term) => {
      const hasSpotFee = sportFees.some(
        (fee) =>
          fee.name === 'Sport Fee' &&
          (fee.term?._id === term._id || fee.term === term._id)
      )
      if (!hasSpotFee) {
        console.log(
          `   ✓ ${term.name} (${term.session?.name || 'Unknown Session'})`
        )
      } else {
        console.log(`   ❌ ${term.name} (already has Sport Fee)`)
      }
    })

    console.log('\n🧪 Testing Option 1: Create "Sports Fee" in First Term...')
    const testFee = {
      name: 'Sports Fee',
      description: 'Sports activities and equipment',
      amount: 5000,
      type: 'Sports',
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

    console.log('\nResult:', createResponse.status)
    if (createResponse.ok) {
      const createdFee = await createResponse.json()
      console.log('✅ SUCCESS: "Sports Fee" created successfully!')
      console.log(`   Fee ID: ${createdFee._id}`)
      console.log(`   Term: ${terms[0].name}`)
      console.log('\n🎉 You can now use "Sports Fee" instead of "Sport Fee"!')
    } else {
      const errorText = await createResponse.text()
      console.log('❌ Failed:', errorText)
    }
  } catch (error) {
    console.error('❌ Resolution failed:', error.message)
  }
}

resolveSportFeeConflict()
