// Debug script to test the exact "Project Fee" creation that's failing
const BASE_URL = 'http://localhost:3000/api/v1'

async function debugProjectFeeCreation() {
  console.log('🔍 Debugging "Project Fee" Creation...\n')

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

    // Get current fees to check for "Project Fee" conflicts
    const feesResponse = await fetch(`${BASE_URL}/fee/all`, {
      headers: authHeaders,
    })
    const fees = await feesResponse.json()

    console.log(`\n📋 Current fees in system: ${fees.length}`)
    const projectFees = fees.filter((fee) =>
      fee.name.toLowerCase().includes('project')
    )
    console.log(`\n🎯 Existing "Project" related fees: ${projectFees.length}`)
    projectFees.forEach((fee) => {
      console.log(
        `  - "${fee.name}" in ${fee.term?.name || 'Unknown Term'} (Created: ${
          fee.createdAt
        })`
      )
    })

    // Get all terms
    const termsResponse = await fetch(`${BASE_URL}/Term/all`, {
      headers: authHeaders,
    })
    const terms = await termsResponse.json()
    console.log(`\n📚 Available terms: ${terms.length}`)

    // Test creating "Project Fee" exactly as shown in the frontend
    console.log(
      '\n🧪 Testing "Project Fee" creation (matching frontend form)...'
    )

    // Try with first term
    const testFee = {
      name: 'Project Fee',
      description: 'For the school project.', // Exact description from screenshot
      amount: 10000, // Exact amount from screenshot
      type: 'Development', // Exact type from screenshot
      school_id: '6856ca374de0e2d916dc329c',
      term_id: terms[0]._id,
      isActive: true,
      isApproved: false,
    }

    console.log('Fee data being sent:')
    console.log(JSON.stringify(testFee, null, 2))

    const createResponse = await fetch(`${BASE_URL}/fee/create`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testFee),
    })

    console.log(`\n📡 Response Status: ${createResponse.status}`)
    console.log(`📡 Response Status Text: ${createResponse.statusText}`)

    if (createResponse.ok) {
      const createdFee = await createResponse.json()
      console.log('✅ SUCCESS: Project Fee created!')
      console.log('Created fee:', JSON.stringify(createdFee, null, 2))
    } else {
      const errorText = await createResponse.text()
      console.log('❌ FAILED to create Project Fee')
      console.log('Error response:', errorText)

      try {
        const errorJson = JSON.parse(errorText)
        console.log('Error message:', errorJson.message)
      } catch (e) {
        console.log('Raw error text:', errorText)
      }
    }

    // If first term failed, try other terms
    if (!createResponse.ok && terms.length > 1) {
      console.log('\n🔄 Trying different terms...')

      for (let i = 1; i < Math.min(terms.length, 3); i++) {
        const altTestFee = {
          ...testFee,
          term_id: terms[i]._id,
        }

        console.log(`\n📝 Trying term: ${terms[i].name}`)
        const altResponse = await fetch(`${BASE_URL}/fee/create`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(altTestFee),
        })

        console.log(`Status: ${altResponse.status}`)
        if (altResponse.ok) {
          const createdFee = await altResponse.json()
          console.log(`✅ SUCCESS in ${terms[i].name}!`)
          console.log('Fee ID:', createdFee._id)
          break
        } else {
          const errorText = await altResponse.text()
          console.log(`❌ Failed in ${terms[i].name}:`, errorText)
        }
      }
    }

    // Check what the frontend might be doing differently
    console.log('\n🔍 Frontend vs Backend comparison:')
    console.log(
      'Backend expects: name, description, amount, type, school_id, term_id'
    )
    console.log(
      'Frontend might be sending: name, decription (typo?), amount, type, school_id, term_id'
    )

    // Test with the typo that might exist in frontend
    console.log('\n🧪 Testing with potential frontend typo...')
    const testFeeWithTypo = {
      name: 'Project Fee Test',
      decription: 'For the school project.', // Note: "decription" not "description"
      amount: 10000,
      type: 'Development',
      school_id: '6856ca374de0e2d916dc329c',
      term_id: terms[0]._id,
      isActive: true,
      isApproved: false,
    }

    const typoResponse = await fetch(`${BASE_URL}/fee/create`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testFeeWithTypo),
    })

    console.log(`\nTypo test status: ${typoResponse.status}`)
    if (typoResponse.ok) {
      console.log('✅ SUCCESS with "decription" typo!')
    } else {
      const errorText = await typoResponse.text()
      console.log('❌ Failed with typo:', errorText)
    }
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

debugProjectFeeCreation()
