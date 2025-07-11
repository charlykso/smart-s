const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function createFeeAsBursar() {
  try {
    console.log('💰 Creating Fee as Bursar - Smart School Academy')
    console.log('=' .repeat(50))
    console.log()

    // Step 1: Login as Bursar
    console.log('1. Logging in as Bursar...')
    const bursarLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bursar@smart-s.com',
      password: 'password123'
    })
    
    const bursarToken = bursarLogin.data.data.token
    const bursarUser = bursarLogin.data.data.user
    console.log('✅ Bursar login successful')
    console.log(`   Name: ${bursarUser.firstname} ${bursarUser.lastname}`)
    console.log(`   School: ${bursarUser.school?.name || 'Smart School Academy'}`)
    console.log(`   Roles: ${bursarUser.roles.join(', ')}`)

    // Step 2: Use known session and term IDs (from our previous setup)
    console.log('\n2. Using known academic structure...')
    const knownSessions = {
      '2023/2024': '68615268cf548180bd920bbc',
      '2024/2025': '68615269cf548180bd920bc1'
    }
    
    const knownTerms = {
      '2024/2025_First': '6861594efcc6cbbde9566141',
      '2024/2025_Second': '6861594ffcc6cbbde9566146',
      '2024/2025_Third': '68615951fcc6cbbde956614b'
    }
    
    console.log('✅ Using 2024/2025 Academic Session')
    console.log('✅ Using First Term for fee assignment')

    // Step 3: Create fee with known IDs (no need to fetch terms)
    console.log('\n3. Creating new fee...')
    
    const newFee = {
      name: 'Tuition Fee - First Term 2024/2025',
      description: 'First term tuition fee for the 2024/2025 academic session',
      amount: 45000,
      school: bursarUser.school?._id || '6856ca374de0e2d916dc329c',
      session: knownSessions['2024/2025'],
      term: knownTerms['2024/2025_First'],
      dueDate: '2024-10-15',
      category: 'Tuition',
      isCompulsory: true
    }

    console.log('Fee details:')
    console.log(`   Name: ${newFee.name}`)
    console.log(`   Amount: ₦${newFee.amount.toLocaleString()}`)
    console.log(`   Category: ${newFee.category}`)
    console.log(`   Due Date: ${newFee.dueDate}`)
    console.log(`   Session ID: ${newFee.session}`)
    console.log(`   Term ID: ${newFee.term}`)

    const feeResponse = await axios.post(`${BASE_URL}/fee/create`, newFee, {
      headers: { Authorization: `Bearer ${bursarToken}` }
    })

    console.log('\n✅ Fee created successfully!')
    console.log(`   Fee ID: ${feeResponse.data._id}`)
    console.log(`   Status: ${feeResponse.data.status || 'Pending Approval'}`)

    // Step 4: Verify fee was created by listing all fees
    console.log('\n4. Verifying fee creation...')
    const allFeesResponse = await axios.get(`${BASE_URL}/fee/all`, {
      headers: { Authorization: `Bearer ${bursarToken}` }
    })

    const allFees = allFeesResponse.data || []
    const createdFee = allFees.find(fee => fee._id === feeResponse.data._id)
    
    if (createdFee) {
      console.log('✅ Fee verified in system:')
      console.log(`   Name: ${createdFee.name}`)
      console.log(`   Amount: ₦${createdFee.amount.toLocaleString()}`)
      console.log(`   School: ${createdFee.school?.name || 'N/A'}`)
      console.log(`   Created: ${new Date(createdFee.createdAt).toLocaleString()}`)
    }

    console.log('\n💰 Fee creation completed successfully!')
    console.log(`Total fees in system: ${allFees.length}`)

  } catch (error) {
    console.error('❌ Fee creation failed:', error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Response:', error.response.data)
    }
  }
}

// Execute if run directly
if (require.main === module) {
  createFeeAsBursar().then(() => {
    console.log('\n💰 Bursar fee creation process completed!')
  })
}

module.exports = { createFeeAsBursar }
