const http = require('http')

function makeRequest(method, path, headers = {}, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        try {
          const response = JSON.parse(body)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response)
          } else {
            reject(
              new Error(`HTTP ${res.statusCode}: ${JSON.stringify(response)}`)
            )
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${body}`))
        }
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

async function debugFeeFiltering() {
  try {
    console.log('=== Fee Loading Debug ===\n')

    // 1. Login as Bursar
    console.log('1. Logging in as Bursar...')
    const loginResponse = await makeRequest(
      'POST',
      '/v1/auth/login',
      {},
      {
        email: 'bursar@smart-s.com',
        password: 'password123',
      }
    )

    const token = loginResponse.data.token
    console.log('✓ Login successful')
    console.log('Token:', token ? 'received' : 'not received')

    // 2. Get students
    console.log('\n2. Fetching students...')
    const studentsResponse = await makeRequest(
      'GET',
      '/v1/school-access/users?role=Student',
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log('Students response:', JSON.stringify(studentsResponse, null, 2))

    const students =
      studentsResponse.data?.users || studentsResponse.data || studentsResponse
    console.log(`✓ Found ${students?.length || 0} students`)

    if (students?.length > 0) {
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
    const feesResponse = await makeRequest('GET', '/v1/fee/all', {
      Authorization: `Bearer ${token}`,
    })

    const fees = feesResponse.data || feesResponse

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
    console.error('Error:', error.message)
  }
}

debugFeeFiltering()
