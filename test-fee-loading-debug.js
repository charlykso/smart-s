const axios = require('axios')

async function testFeeLoading() {
  console.log('=== Testing Fee Loading Debug ===\n')

  const baseURL = 'http://localhost:5000'
  let authToken = ''

  try {
    // 1. Login as Bursar
    console.log('1. Logging in as Bursar...')
    const loginResponse = await axios.post(`${baseURL}/api/users/login`, {
      email: 'bursar@smartschool.edu',
      password: 'password123',
    })

    authToken = loginResponse.data.token
    const user = loginResponse.data.user
    console.log('✓ Login successful')
    console.log('  User:', user.firstname, user.lastname)
    console.log('  Roles:', user.roles)
    console.log('  School:', user.school)
    console.log('  Token:', authToken.substring(0, 20) + '...\n')

    // 2. Test fee endpoints
    console.log('2. Testing fee endpoints...')

    // Test all fees endpoint
    console.log('  a) Testing GET /api/fees/all')
    try {
      const allFeesResponse = await axios.get(`${baseURL}/api/fees/all`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      console.log('    ✓ Success - Found', allFeesResponse.data.length, 'fees')

      // Show first few fees for debugging
      if (allFeesResponse.data.length > 0) {
        console.log('    Sample fees:')
        allFeesResponse.data.slice(0, 3).forEach((fee, index) => {
          console.log(
            `      ${index + 1}. ${fee.name} - ${fee.amount} (${fee.type})`
          )
          console.log(
            `         School: ${
              typeof fee.school === 'object'
                ? fee.school?.name || fee.school?._id
                : fee.school
            }`
          )
          console.log(
            `         Term: ${
              typeof fee.term === 'object'
                ? fee.term?.name || fee.term?._id
                : fee.term
            }`
          )
          console.log(
            `         Active: ${fee.isActive}, Approved: ${fee.isApproved}`
          )
        })
      }
    } catch (error) {
      console.log(
        '    ✗ Failed:',
        error.response?.data?.message || error.message
      )
    }

    // Test fees by school endpoint
    console.log('\n  b) Testing GET /api/fees/school')
    try {
      const schoolFeesResponse = await axios.get(`${baseURL}/api/fees/school`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      console.log(
        '    ✓ Success - Found',
        schoolFeesResponse.data.length,
        'school fees'
      )

      if (schoolFeesResponse.data.length > 0) {
        console.log('    Sample school fees:')
        schoolFeesResponse.data.slice(0, 3).forEach((fee, index) => {
          console.log(
            `      ${index + 1}. ${fee.name} - ${fee.amount} (${fee.type})`
          )
          console.log(
            `         School: ${
              typeof fee.school === 'object'
                ? fee.school?.name || fee.school?._id
                : fee.school
            }`
          )
          console.log(
            `         Term: ${
              typeof fee.term === 'object'
                ? fee.term?.name || fee.term?._id
                : fee.term
            }`
          )
          console.log(
            `         Active: ${fee.isActive}, Approved: ${fee.isApproved}`
          )
        })
      }
    } catch (error) {
      console.log(
        '    ✗ Failed:',
        error.response?.data?.message || error.message
      )
    }

    // 3. Test student selection and fee filtering
    console.log('\n3. Testing student selection and fee filtering...')

    // Get students first
    console.log('  a) Getting students...')
    try {
      const studentsResponse = await axios.get(
        `${baseURL}/api/school-access/users?role=Student`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      )

      if (studentsResponse.data.length > 0) {
        const student = studentsResponse.data[0]
        console.log('    ✓ Found student:', student.firstname, student.lastname)
        console.log('      School:', student.school)
        console.log('      Reg No:', student.regNo)

        // Now simulate fee filtering for this student
        console.log('\n  b) Simulating fee filtering for student...')

        // Get all fees again for filtering simulation
        const allFeesResponse = await axios.get(`${baseURL}/api/fees/all`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })

        const allFees = allFeesResponse.data
        console.log('    Total fees available:', allFees.length)

        // Filter fees like frontend does
        const studentSchoolFees = allFees.filter((fee) => {
          const isApproved = fee.isApproved
          const isActive = fee.isActive
          const schoolMatch =
            typeof fee.school === 'object' && fee.school?._id
              ? fee.school._id === student.school
              : true

          console.log(`      Fee: ${fee.name}`)
          console.log(`        - Approved: ${isApproved}`)
          console.log(`        - Active: ${isActive}`)
          console.log(
            `        - School Match: ${schoolMatch} (fee.school: ${
              typeof fee.school === 'object' ? fee.school?._id : fee.school
            }, student.school: ${student.school})`
          )

          return isApproved && isActive && schoolMatch
        })

        console.log(
          '    ✓ Filtered fees for student:',
          studentSchoolFees.length
        )
        studentSchoolFees.forEach((fee, index) => {
          console.log(`      ${index + 1}. ${fee.name} - ${fee.amount}`)
        })
      } else {
        console.log('    ✗ No students found')
      }
    } catch (error) {
      console.log(
        '    ✗ Failed to get students:',
        error.response?.data?.message || error.message
      )
    }
  } catch (error) {
    console.error(
      '✗ Login failed:',
      error.response?.data?.message || error.message
    )
  }
}

testFeeLoading().catch(console.error)
