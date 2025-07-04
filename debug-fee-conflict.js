// Debug script to check existing fees and understand the duplicate error
const BASE_URL = 'http://localhost:3000/api/v1'

async function debugFeeConflict() {
  console.log('🔍 Debugging Fee Creation Conflict...\n')

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

    // Get all existing fees
    const feesResponse = await fetch(`${BASE_URL}/fee/all`, {
      headers: authHeaders,
    })

    const fees = await feesResponse.json()
    console.log(`\n📋 Existing Fees (${fees.length} total):`)
    console.log('==========================================')

    fees.forEach((fee, index) => {
      console.log(`${index + 1}. Name: "${fee.name}"`)
      console.log(`   Type: ${fee.type}`)
      console.log(
        `   Term: ${fee.term?.name || 'No term'} (ID: ${
          fee.term?._id || fee.term
        })`
      )
      console.log(
        `   School: ${fee.school?.name || 'No school'} (ID: ${
          fee.school?._id || fee.school
        })`
      )
      console.log(`   Amount: ${fee.amount}`)
      console.log(`   Active: ${fee.isActive}`)
      console.log(`   Approved: ${fee.isApproved}`)
      console.log(`   Created: ${fee.createdAt}`)
      console.log('   ---')
    })

    // Get all terms to see what's available
    const termsResponse = await fetch(`${BASE_URL}/Term/all`, {
      headers: authHeaders,
    })

    const terms = await termsResponse.json()
    console.log(`\n📚 Available Terms (${terms.length} total):`)
    console.log('==========================================')

    terms.forEach((term, index) => {
      console.log(`${index + 1}. ${term.name} (ID: ${term._id})`)
      console.log(`   Session: ${term.session?.name || 'Unknown'}`)
      console.log(`   Dates: ${term.startDate} to ${term.endDate}`)
      console.log('   ---')
    })

    // Test the exact fee that's failing
    console.log('\n🧪 Testing the exact fee creation that failed...')
    const testFee = {
      name: 'Sport Fee',
      description: 'Sports activities',
      amount: 5000,
      type: 'Sports',
      school_id: '6856ca374de0e2d916dc329c',
      term_id: terms[0]._id, // Use first available term
      isActive: true,
      isApproved: false,
    }

    console.log('Test fee data:')
    console.log('  Name:', testFee.name)
    console.log('  Type:', testFee.type)
    console.log('  Term ID:', testFee.term_id)
    console.log('  School ID:', testFee.school_id)
    console.log('  Amount:', testFee.amount)

    // Check for conflicts manually
    console.log('\n🔍 Checking for conflicts...')
    const nameConflicts = fees.filter((fee) => fee.name === testFee.name)
    const termConflicts = fees.filter(
      (fee) => fee.term?._id === testFee.term_id || fee.term === testFee.term_id
    )

    console.log(
      `Name conflicts (${nameConflicts.length}):`,
      nameConflicts.map((f) => f.name)
    )
    console.log(
      `Term conflicts (${termConflicts.length}):`,
      termConflicts.map((f) => f.name)
    )

    // Explain the duplicate check logic
    console.log('\n⚠️ CURRENT DUPLICATE CHECK LOGIC ISSUE:')
    console.log(
      'The backend checks: name === "Sport Fee" OR term_id === selected_term'
    )
    console.log(
      'This means if ANY fee exists in the selected term, it will fail!'
    )
    console.log(
      'This is too restrictive and should be: name === "Sport Fee" AND term_id === selected_term'
    )

    if (termConflicts.length > 0) {
      console.log('\n❌ CONFLICT DETECTED:')
      console.log(
        `There are ${termConflicts.length} fee(s) already in the selected term:`
      )
      termConflicts.forEach((fee) => {
        console.log(`  - "${fee.name}" (${fee.type})`)
      })
      console.log(
        'The current logic prevents creating ANY new fee in this term!'
      )
    }
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  }
}

debugFeeConflict()
