const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testCreationOperations() {
  try {
    console.log('🧪 TESTING CREATION OPERATIONS')
    console.log('='.repeat(50))

    // Test 1: ICT Admin Login and Principal Creation
    console.log('Step 1: Testing ICT Admin Principal Creation...')
    const ictLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ictadmin@smart-s.com',
      password: 'password123',
    })

    const ictToken = ictLogin.data.data.token
    const ictUser = ictLogin.data.data.user
    let principalEmail = null // Store principal email for later use

    console.log('✅ ICT Admin logged in successfully')
    console.log('User school:', ictUser.school?.name || 'No school')

    // Get schools available to ICT admin
    console.log('\nStep 2: Getting available schools...')
    try {
      const schoolsResponse = await axios.get(`${BASE_URL}/schools/by-group`, {
        headers: { Authorization: `Bearer ${ictToken}` },
      })
      console.log(
        '✅ Schools retrieved:',
        schoolsResponse.data.schools?.length || 0
      )
      if (schoolsResponse.data.schools?.length > 0) {
        console.log(
          'Available schools:',
          schoolsResponse.data.schools.map((s) => s.name)
        )
      }
    } catch (error) {
      console.log(
        '❌ Failed to get schools:',
        error.response?.data?.message || error.message
      )
    }

    // Test Principal Creation
    console.log('\nStep 3: Creating a Principal...')
    try {
      principalEmail = `principal.test.${Date.now()}@school.com`
      const principalData = {
        firstname: 'Test',
        lastname: 'Principal',
        email: principalEmail,
        phone: '+1234567890',
        roles: ['Principal'],
        gender: 'Male',
        type: 'day',
        regNo: `PRIN${Date.now()}`,
        school: ictUser.school?._id || ictUser.school,
      }

      const createResponse = await axios.post(
        `${BASE_URL}/users`,
        principalData,
        {
          headers: { Authorization: `Bearer ${ictToken}` },
        }
      )

      console.log('✅ Principal created successfully!')
      console.log('Response:', createResponse.data.message)

      // Test if principal appears in user list
      console.log('\nStep 4: Checking if principal appears in user list...')
      const usersResponse = await axios.get(`${BASE_URL}/school-access/users`, {
        headers: { Authorization: `Bearer ${ictToken}` },
      })

      const users = usersResponse.data.data?.users || []
      const newPrincipal = users.find(
        (user) => user.email === principalData.email
      )

      if (newPrincipal) {
        console.log('✅ Principal found in user list!')
        console.log('Principal details:', {
          name: `${newPrincipal.firstname} ${newPrincipal.lastname}`,
          email: newPrincipal.email,
          roles: newPrincipal.roles,
        })
      } else {
        console.log('❌ Principal NOT found in user list')
      }
    } catch (error) {
      console.log(
        '❌ Principal creation failed:',
        error.response?.data?.message || error.message
      )
      console.log('Error details:', error.response?.data)
    }

    // Test 2: Principal Login and Fee Approval
    console.log('\n' + '='.repeat(50))
    console.log('Step 5: Testing Principal Fee Approval...')

    try {
      // Try to login with the newly created principal (default password is 'password123')
      let principalLogin
      try {
        principalLogin = await axios.post(`${BASE_URL}/auth/login`, {
          email: principalEmail,
          password: 'password123',
        })
        console.log(
          `✅ Principal logged in with newly created account: ${principalEmail}`
        )
      } catch (loginError) {
        console.log(
          `❌ Failed to login with newly created principal:`,
          loginError.response?.data?.message || loginError.message
        )

        // Try with existing principals as fallback
        const principalEmails = [
          'principal@smart-s.com',
          'principal@greenwood.edu',
          'principal@school.com',
        ]

        for (const email of principalEmails) {
          try {
            principalLogin = await axios.post(`${BASE_URL}/auth/login`, {
              email: email,
              password: 'password123',
            })
            console.log(`✅ Principal logged in with existing email: ${email}`)
            break
          } catch (fallbackError) {
            console.log(
              `❌ Failed to login with ${email}:`,
              fallbackError.response?.data?.message || fallbackError.message
            )
          }
        }
      }

      if (!principalLogin) {
        console.log(
          '❌ Could not login with any principal email, skipping fee approval test'
        )
        return
      }

      const principalToken = principalLogin.data.data.token
      console.log('✅ Principal logged in successfully')

      // Get pending fees
      const feesResponse = await axios.get(`${BASE_URL}/fee/all`, {
        headers: { Authorization: `Bearer ${principalToken}` },
      })

      const fees = feesResponse.data.data || feesResponse.data
      console.log(`✅ Retrieved ${fees.length} fees`)

      // Find a fee to approve (if any)
      const pendingFee = fees.find((fee) => !fee.isApproved)
      if (pendingFee) {
        console.log(
          'Found pending fee:',
          pendingFee.feeName || pendingFee.name || 'Unknown fee name'
        )
        console.log('Fee ID:', pendingFee._id)

        // Test fee approval
        try {
          const approveResponse = await axios.put(
            `${BASE_URL}/approve/${pendingFee._id}/approve`,
            {},
            {
              headers: { Authorization: `Bearer ${principalToken}` },
            }
          )
          console.log('✅ Fee approval successful!')
          console.log('Response:', approveResponse.data.message)
        } catch (approveError) {
          console.log(
            '❌ Fee approval failed:',
            approveError.response?.data?.message || approveError.message
          )
        }
      } else {
        console.log('ℹ️ No pending fees found to approve')
      }
    } catch (error) {
      console.log(
        '❌ Principal login/fee approval failed:',
        error.response?.data?.message || error.message
      )
    }

    // Test 3: Bulk Student Upload
    console.log('\n' + '='.repeat(50))
    console.log('Step 6: Testing Bulk Student Upload...')

    try {
      // Check if bulk upload endpoint is accessible
      const templateResponse = await axios.get(
        `${BASE_URL}/bulk-students/template`,
        {
          headers: { Authorization: `Bearer ${ictToken}` },
        }
      )

      console.log('✅ Bulk upload template endpoint accessible')
      console.log(
        'Template response type:',
        templateResponse.headers['content-type']
      )

      // Test upload history endpoint
      const historyResponse = await axios.get(
        `${BASE_URL}/bulk-students/history`,
        {
          headers: { Authorization: `Bearer ${ictToken}` },
        }
      )

      console.log('✅ Bulk upload history endpoint accessible')
      console.log('History:', historyResponse.data.message)
    } catch (error) {
      console.log(
        '❌ Bulk upload test failed:',
        error.response?.data?.message || error.message
      )
    }

    console.log('\n🎯 CREATION OPERATIONS TEST COMPLETED')
  } catch (error) {
    console.error(
      '❌ Test failed:',
      error.response?.data?.message || error.message
    )
  }
}

// Run the test
testCreationOperations()
