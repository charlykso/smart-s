// Test current fee creation to debug the exact error
const BASE_URL = 'http://localhost:3000/api/v1'

async function testCurrentFeeCreation() {
  console.log('🧪 Testing Current Fee Creation Issue...\n')

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

    // Get terms for testing
    const termsResponse = await fetch(`${BASE_URL}/Term/all`, {
      headers: authHeaders,
    })
    const terms = await termsResponse.json()
    console.log(`✅ Found ${terms.length} terms`)

    // Test creating "Project Fee" (like in your screenshot)
    console.log(
      '\n🧪 Testing "Project Fee" creation (matching your screenshot)...'
    )
    const projectFee = {
      name: 'Project Fee',
      description: 'Project activities and materials',
      amount: 8000,
      type: 'Academic',
      school_id: '6856ca374de0e2d916dc329c',
      term_id: terms[0]._id,
      isActive: true,
      isApproved: false,
    }

    console.log('Project Fee data:')
    console.log('  Name:', projectFee.name)
    console.log('  Description:', projectFee.description)
    console.log('  Amount:', projectFee.amount)
    console.log('  Type:', projectFee.type)
    console.log('  Term ID:', projectFee.term_id)
    console.log('  School ID:', projectFee.school_id)

    const createResponse = await fetch(`${BASE_URL}/fee/create`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(projectFee),
    })

    console.log('\n📊 Response Details:')
    console.log('Status Code:', createResponse.status)
    console.log('Status Text:', createResponse.statusText)
    console.log(
      'Headers:',
      Object.fromEntries(createResponse.headers.entries())
    )

    if (createResponse.ok) {
      const responseData = await createResponse.json()
      console.log('\n✅ SUCCESS! Fee created:')
      console.log('Response format:', typeof responseData)
      console.log('Response keys:', Object.keys(responseData))
      console.log('Full response:', JSON.stringify(responseData, null, 2))

      // Check if response has expected format for frontend
      if (responseData.success && responseData.data) {
        console.log('\n✅ Response format is correct for frontend')
        console.log('Success:', responseData.success)
        console.log('Fee ID:', responseData.data._id)
        console.log('Fee Name:', responseData.data.name)
      } else if (responseData._id) {
        console.log(
          '\n⚠️ Response format is direct fee object (may cause frontend issues)'
        )
        console.log('Fee ID:', responseData._id)
        console.log('Fee Name:', responseData.name)
      } else {
        console.log('\n❌ Unexpected response format!')
      }
    } else {
      const errorText = await createResponse.text()
      console.log('\n❌ FAILED to create fee:')
      console.log('Error response:', errorText)

      try {
        const errorJson = JSON.parse(errorText)
        console.log('Error message:', errorJson.message)
      } catch {
        console.log('Raw error text:', errorText)
      }
    }

    // Check current fees to see if it was actually created
    console.log('\n🔍 Checking current fees to see if Project Fee exists...')
    const currentFeesResponse = await fetch(`${BASE_URL}/fee/all`, {
      headers: authHeaders,
    })

    if (currentFeesResponse.ok) {
      const currentFees = await currentFeesResponse.json()
      const projectFees = currentFees.filter((fee) =>
        fee.name.toLowerCase().includes('project')
      )

      console.log(`Found ${projectFees.length} project-related fees:`)
      projectFees.forEach((fee) => {
        console.log(
          `  - "${fee.name}" (${fee.type}) in ${
            fee.term?.name || 'Unknown Term'
          }`
        )
        console.log(`    Created: ${fee.createdAt}`)
      })
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

testCurrentFeeCreation()
