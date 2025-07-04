const axios = require('axios')

async function testStudentLoading() {
  try {
    // First, login as bursar
    console.log('1. Logging in as bursar...')
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'bursar@smart-s.com',
        password: 'BursarPass123!',
      }
    )

    if (!loginResponse.data.success) {
      console.error('Login failed:', loginResponse.data.message)
      return
    }

    const token = loginResponse.data.data.token
    const user = loginResponse.data.data.user
    console.log('✅ Login successful!')
    console.log('User:', user.firstname, user.lastname)
    console.log('Roles:', user.roles)
    console.log('School:', user.school)

    // Now test getting students
    console.log('\n2. Fetching students...')
    const studentsResponse = await axios.get(
      'http://localhost:3000/api/v1/school-access/users?role=Student',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('✅ Students API call successful!')
    console.log('Response:', JSON.stringify(studentsResponse.data, null, 2))

    if (studentsResponse.data.success && studentsResponse.data.data.users) {
      const students = studentsResponse.data.data.users
      console.log(`\n📊 Found ${students.length} students:`)
      students.forEach((student) => {
        console.log(
          `  - ${student.firstname} ${student.lastname} (${
            student.regNo
          }) - Roles: ${JSON.stringify(student.roles)}`
        )
      })
    }
  } catch (error) {
    console.error(
      '❌ Error:',
      error.response ? error.response.data : error.message
    )
  }
}

testStudentLoading()
