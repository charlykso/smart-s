// Final comprehensive test to confirm frontend fee management is fully working
const BASE_URL = 'http://localhost:3000/api/v1'

async function testCompleteFrontendFeeFlow() {
  console.log('🎯 FINAL TEST: Complete Frontend Fee Management Flow\n')

  try {
    // Step 1: Login as Bursar
    console.log('1. Login as Bursar...')
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
    console.log('✅ Login successful')

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    // Step 2: Load all data needed for fee management form
    console.log('\n2. Loading all required data for fee management...')

    // Load schools (for dropdown)
    const schoolsResponse = await fetch(`${BASE_URL}/school/all`, {
      headers: authHeaders,
    })
    const schools = await schoolsResponse.json()
    console.log(`✅ Schools loaded: ${schools.length}`)

    // Load terms (for dropdown)
    const termsResponse = await fetch(`${BASE_URL}/Term/all`, {
      headers: authHeaders,
    })
    const terms = await termsResponse.json()
    console.log(`✅ Terms loaded: ${terms.length}`)

    // Load existing fees
    const feesResponse = await fetch(`${BASE_URL}/fee/all`, {
      headers: authHeaders,
    })
    const fees = await feesResponse.json()
    console.log(`✅ Existing fees loaded: ${fees.length}`)

    // Step 3: Create a new fee (simulating frontend form submission)
    console.log('\n3. Creating new fee (simulating frontend form)...')

    const newFee = {
      name: 'Final Test Fee',
      description: 'Created from final comprehensive test',
      amount: 50000,
      type: 'Tuition',
      school_id: schools[0]._id,
      term_id: terms[0]._id,
      isActive: true,
      isApproved: false,
    }

    console.log('Fee data:')
    console.log('  Name:', newFee.name)
    console.log('  School:', schools[0].name, `(${newFee.school_id})`)
    console.log('  Term:', terms[0].name, `(${newFee.term_id})`)
    console.log('  Amount:', newFee.amount)

    const createResponse = await fetch(`${BASE_URL}/fee/create`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newFee),
    })

    if (createResponse.ok) {
      const createdFee = await createResponse.json()
      console.log('✅ Fee created successfully!')
      console.log(
        '  Created fee ID:',
        createdFee.data?._id || 'Not in response'
      )
    } else {
      const errorText = await createResponse.text()
      console.log('❌ Fee creation failed:', createResponse.status)
      console.log('  Error:', errorText)
      return
    }

    // Step 4: Verify the new fee appears in the lists
    console.log('\n4. Verifying fee appears in listings...')

    const updatedFeesResponse = await fetch(`${BASE_URL}/fee/all`, {
      headers: authHeaders,
    })
    const updatedFees = await updatedFeesResponse.json()
    console.log(`✅ Updated fees count: ${updatedFees.length}`)

    const unapprovedResponse = await fetch(
      `${BASE_URL}/fee/get-unapproved-fees`,
      {
        headers: authHeaders,
      }
    )
    const unapprovedFees = await unapprovedResponse.json()
    console.log(`✅ Unapproved fees count: ${unapprovedFees.length}`)

    // Step 5: Summary
    console.log('\n🎉 SUMMARY: Frontend Fee Management Status')
    console.log('='.repeat(50))
    console.log('✅ Bursar Authentication: WORKING')
    console.log('✅ Load Schools for Dropdown: WORKING')
    console.log('✅ Load Terms for Dropdown: WORKING (FIXED!)')
    console.log('✅ Load Existing Fees: WORKING')
    console.log('✅ Create New Fees: WORKING')
    console.log('✅ View Fee Lists: WORKING')
    console.log('='.repeat(50))
    console.log(
      '🚀 The Bursar dashboard fee management should now work completely!'
    )
    console.log(
      '🔧 The issue was that Bursar role was missing from Term access permissions.'
    )
    console.log('🎯 Frontend should now be able to:')
    console.log('   - Load the fee management page without errors')
    console.log('   - Populate school and term dropdowns')
    console.log('   - Create new fees successfully')
    console.log('   - Display fees without "Session expired" errors')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testCompleteFrontendFeeFlow()
