const axios = require('axios')

const baseURL = 'http://localhost:5000/api'

async function debugFeeFiltering() {
  try {
    console.log('=== Fee Loading Debug ===\n')

    // 1. Login as Bursar
    console.log('1. Logging in as Bursar...')
    const loginResponse = await axios.post(`${baseURL}/users/login`, {
      email: 'bursar@greenwood.edu',
      password: 'bursar123',
    })

    const token = loginResponse.data.token
    console.log('✓ Login successful')

    // 2. Get students
    console.log('\n2. Fetching students...')
    const studentsResponse = await axios.get(
      `${baseURL}/school-access/get-user-by-role/student`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const students = studentsResponse.data
    console.log(`✓ Found ${students.length} students`)

    if (students.length > 0) {
      const student = students[0]
      console.log(
        `\nSelected student: ${student.firstname} ${student.lastname}`
      )
      console.log(
        `Student school: ${student.school} (type: ${typeof student.school})`
      )
      console.log(`Student regNo: ${student.regNo}`)
    }

    // 3. Get all fees
    console.log('\n3. Fetching all fees...')
    const feesResponse = await axios.get(`${baseURL}/fees/`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const fees = feesResponse.data
    console.log(`✓ Found ${fees.length} total fees`)

    // 4. Show fee details
    console.log('\n4. Fee details:')
    fees.forEach((fee, index) => {
      console.log(`Fee ${index + 1}:`)
      console.log(`  Name: ${fee.name}`)
      console.log(`  School: ${fee.school} (type: ${typeof fee.school})`)
      console.log(
        `  School ID: ${
          typeof fee.school === 'object' ? fee.school?._id : fee.school
        }`
      )
      console.log(`  isApproved: ${fee.isApproved}`)
      console.log(`  isActive: ${fee.isActive}`)
      console.log(`  Amount: ${fee.amount}`)
      console.log('')
    })

    // 5. Test filtering logic
    if (students.length > 0 && fees.length > 0) {
      const student = students[0]
      console.log('5. Testing fee filtering logic...')

      // Current logic from frontend
      const filteredFees = fees.filter(
        (fee) =>
          fee.isApproved &&
          fee.isActive &&
          (typeof fee.school === 'object' && fee.school?._id
            ? fee.school._id === student.school
            : true)
      )

      console.log(`\nCurrent filtering result: ${filteredFees.length} fees`)

      // Alternative logic - handle both string and object school
      const betterFilteredFees = fees.filter((fee) => {
        if (!fee.isApproved || !fee.isActive) return false

        const feeSchoolId =
          typeof fee.school === 'object' ? fee.school?._id : fee.school
        const studentSchoolId =
          typeof student.school === 'object'
            ? student.school?._id
            : student.school

        return feeSchoolId === studentSchoolId
      })

      console.log(`Better filtering result: ${betterFilteredFees.length} fees`)

      if (betterFilteredFees.length > 0) {
        console.log('\nFiltered fees:')
        betterFilteredFees.forEach((fee, index) => {
          console.log(`  ${index + 1}. ${fee.name} - $${fee.amount}`)
        })
      }
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

debugFeeFiltering()
