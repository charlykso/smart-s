const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testBursarAccessControl() {
  try {
    console.log(
      '🔒 Testing Bursar Access Control and Fee Management Workflow\n'
    ) // First, test with a bursar login
    console.log('1. Testing Bursar Login...')
    const bursarLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bursar@smart-s.com',
      password: 'password123',
    })

    if (!bursarLogin.data.success) {
      console.log('❌ Bursar login failed - creating test bursar...')
      // This would require running a setup script first
      return
    }

    const bursarToken = bursarLogin.data.data.token
    const bursarUser = bursarLogin.data.data.user
    console.log('✅ Bursar login successful')
    console.log(`   - Name: ${bursarUser.firstname} ${bursarUser.lastname}`)
    console.log(
      `   - School: ${bursarUser.school?.name || 'No school assigned'}`
    )
    console.log(`   - Roles: ${bursarUser.roles.join(', ')}`)

    // Test 1: Bursar should only see fees for their school
    console.log(
      '\n2. Testing Bursar Fee Access (should only see own school)...'
    )
    try {
      const feesResponse = await axios.get(`${BASE_URL}/fee/all`, {
        headers: { Authorization: `Bearer ${bursarToken}` },
      })

      const fees = feesResponse.data
      console.log(`✅ Bursar can access ${fees.length} fees`)

      // Check if all fees belong to bursar's school
      const bursarSchoolId = bursarUser.school?._id || bursarUser.school
      const foreignFees = fees.filter(
        (fee) =>
          fee.school?._id !== bursarSchoolId && fee.school !== bursarSchoolId
      )

      if (foreignFees.length === 0) {
        console.log(
          "✅ All fees belong to bursar's school - access control working!"
        )
      } else {
        console.log(
          `❌ Found ${foreignFees.length} fees from other schools - access control failed!`
        )
        foreignFees.forEach((fee) => {
          console.log(
            `   - Fee: ${fee.name} from school: ${
              fee.school?.name || fee.school
            }`
          )
        })
      }
    } catch (error) {
      console.log(
        '❌ Error accessing fees:',
        error.response?.data?.message || error.message
      )
    }

    // Test 2: Bursar should be able to create fees for their school
    console.log('\n3. Testing Bursar Fee Creation...')
    try {
      const newFeeData = {
        term_id: '60f7b1b3b3b3b3b3b3b3b3b3', // You'd need a valid term ID
        name: 'Test Bursar Fee',
        decription: 'Fee created by bursar for testing',
        type: 'Academic',
        amount: 5000,
        isActive: true,
        isInstallmentAllowed: false,
        no_ofInstallments: 1,
      }

      const createResponse = await axios.post(
        `${BASE_URL}/fee/create`,
        newFeeData,
        {
          headers: { Authorization: `Bearer ${bursarToken}` },
        }
      )

      if (createResponse.data.success) {
        console.log('✅ Bursar can create fees')
        console.log(`   - Fee created: ${createResponse.data.data.name}`)
        console.log(`   - School: ${createResponse.data.data.school}`)
        console.log(`   - Approved: ${createResponse.data.data.isApproved}`)

        if (!createResponse.data.data.isApproved) {
          console.log(
            '✅ Fee created as unapproved - bursar cannot auto-approve!'
          )
        } else {
          console.log('❌ Fee was auto-approved - this should not happen!')
        }
      }
    } catch (error) {
      console.log(
        '❌ Error creating fee:',
        error.response?.data?.message || error.message
      )
    }

    // Test 3: Try principal login and approval
    console.log('\n4. Testing Principal Login and Fee Approval...')
    try {
      const principalLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'principal@smart-s.com',
        password: 'password123',
      })

      if (principalLogin.data.success) {
        const principalToken = principalLogin.data.data.token
        const principalUser = principalLogin.data.data.user
        console.log('✅ Principal login successful')
        console.log(
          `   - Name: ${principalUser.firstname} ${principalUser.lastname}`
        )
        console.log(
          `   - School: ${principalUser.school?.name || 'No school assigned'}`
        )

        // Get unapproved fees
        const unapprovedFeesResponse = await axios.get(
          `${BASE_URL}/fee/get-unapproved-fees`,
          {
            headers: { Authorization: `Bearer ${principalToken}` },
          }
        )

        const unapprovedFees = unapprovedFeesResponse.data
        console.log(
          `✅ Principal can see ${unapprovedFees.length} unapproved fees`
        )

        if (unapprovedFees.length > 0) {
          // Try to approve the first fee
          const feeToApprove = unapprovedFees[0]
          console.log(`\n5. Testing Fee Approval for: ${feeToApprove.name}`)

          const approvalResponse = await axios.put(
            `${BASE_URL}/approve/${feeToApprove._id}/approve`,
            {},
            { headers: { Authorization: `Bearer ${principalToken}` } }
          )

          if (approvalResponse.data.success) {
            console.log('✅ Principal successfully approved fee')
            console.log(`   - Message: ${approvalResponse.data.message}`)
          }
        } else {
          console.log('ℹ️  No unapproved fees found to test approval')
        }
      }
    } catch (error) {
      console.log(
        '❌ Error with principal operations:',
        error.response?.data?.message || error.message
      )
    }

    // Test 4: Test bursar trying to access another school's data
    console.log('\n6. Testing Cross-School Access Prevention...')
    try {
      // This would require knowing another school's ID
      const anotherSchoolId = '60f7b1b3b3b3b3b3b3b3b3b4'

      const crossSchoolResponse = await axios.get(
        `${BASE_URL}/fee/school/${anotherSchoolId}`,
        { headers: { Authorization: `Bearer ${bursarToken}` } }
      )

      console.log(
        "❌ Bursar was able to access another school's fees - security issue!"
      )
    } catch (error) {
      if (error.response?.status === 403) {
        console.log("✅ Bursar correctly denied access to other school's fees")
      } else {
        console.log(
          '⚠️  Unexpected error:',
          error.response?.data?.message || error.message
        )
      }
    }

    console.log('\n🎉 Bursar access control testing completed!')
  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    }
  }
}

// Run the test
console.log('Starting Bursar Access Control Tests...\n')
testBursarAccessControl().catch(console.error)
