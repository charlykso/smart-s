// Quick test for specific functionality
const axios = require('axios')

;(async () => {
  console.log('🔧 Quick Functionality Test...\n')

  try {
    // Login as ICT Admin to get access
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'ictadmin@smart-s.com',
        password: 'password123',
      }
    )

    const token = loginResponse.data.data.token
    const user = loginResponse.data.data.user
    console.log('✅ ICT Admin Login Success')
    console.log('User:', user.firstname, user.lastname)
    console.log('School:', user.school?.name || 'No school')
    console.log('')

    const headers = { Authorization: `Bearer ${token}` }

    // Test 1: Check if there are any fees
    console.log('📋 Test 1: Checking Fees...')
    try {
      const feesResponse = await axios.get(
        'http://localhost:3000/api/v1/fee/all',
        { headers }
      )
      console.log('✅ Fees endpoint accessible')
      console.log('Total fees:', feesResponse.data.length)

      if (feesResponse.data.length > 0) {
        const fee = feesResponse.data[0]
        console.log(
          'Sample fee:',
          fee.name,
          '- Amount:',
          fee.amount,
          '- Approved:',
          fee.isApproved
        )
      }
    } catch (error) {
      console.log(
        '❌ Fees access failed:',
        error.response?.data?.message || error.message
      )
    }

    // Test 2: Check payment profiles
    console.log('\n💳 Test 2: Checking Payment Profiles...')
    try {
      const schoolId = user.school?._id || user.school
      if (schoolId) {
        const paymentProfileResponse = await axios.get(
          `http://localhost:3000/api/v1/paymentprofile/all/${schoolId}`,
          { headers }
        )
        console.log('✅ Payment profiles accessible')
        console.log(
          'Payment profiles count:',
          paymentProfileResponse.data.length
        )

        if (paymentProfileResponse.data.length > 0) {
          const profile = paymentProfileResponse.data[0]
          console.log('Payment profile exists for school')
          console.log('Paystack enabled:', profile.activate_ps)
          console.log('Flutterwave enabled:', profile.activate_fw)
          console.log('Bank details:', profile.bank_name ? 'Yes' : 'No')
        }
      }
    } catch (error) {
      console.log(
        '❌ Payment profiles access failed:',
        error.response?.data?.message || error.message
      )
    }

    // Test 3: Try to create a test student with known credentials
    console.log('\n👨‍🎓 Test 3: Creating Test Student...')
    try {
      const testStudentData = {
        firstname: 'Test',
        lastname: 'Student',
        email: 'teststudent@test.com',
        phone: '1234567890',
        gender: 'Male',
        regNo: 'TEST001',
        roles: ['Student'],
        school: user.school?._id || user.school,
        password: 'password123',
      }

      const createStudentResponse = await axios.post(
        'http://localhost:3000/api/v1/users',
        testStudentData,
        { headers }
      )
      console.log('✅ Test student created successfully')
      console.log('Student ID:', createStudentResponse.data.user?._id)

      // Try to login with the new student
      const studentLoginResponse = await axios.post(
        'http://localhost:3000/api/v1/auth/login',
        {
          email: 'teststudent@test.com',
          password: 'password123',
        }
      )
      console.log('✅ Test student login successful')

      const studentToken = studentLoginResponse.data.data.token
      const studentHeaders = { Authorization: `Bearer ${studentToken}` }

      // Test student fee access
      const studentFeesResponse = await axios.get(
        'http://localhost:3000/api/v1/fee/student/approved-fees',
        { headers: studentHeaders }
      )
      console.log('✅ Student can access their fees')
      console.log(
        'Student fees count:',
        studentFeesResponse.data.data?.length || studentFeesResponse.data.length
      )
    } catch (error) {
      console.log(
        '❌ Test student creation/login failed:',
        error.response?.data?.message || error.message
      )
    }

    // Test 4: Test Bursar Cash Payment
    console.log('\n💰 Test 4: Testing Bursar Cash Payment...')
    try {
      // Login as bursar
      const bursarLoginResponse = await axios.post(
        'http://localhost:3000/api/v1/auth/login',
        {
          email: 'bursar@smart-s.com',
          password: 'password123',
        }
      )

      const bursarToken = bursarLoginResponse.data.data.token
      const bursarHeaders = { Authorization: `Bearer ${bursarToken}` }
      console.log('✅ Bursar login successful')

      // Get students
      const studentsResponse = await axios.get(
        'http://localhost:3000/api/v1/user/student/all',
        { headers: bursarHeaders }
      )
      console.log('✅ Bursar can access students')
      console.log(
        'Students count:',
        studentsResponse.data.data?.length || studentsResponse.data.length
      )

      // Get approved fees
      const approvedFeesResponse = await axios.get(
        'http://localhost:3000/api/v1/fee/get-approved-fees',
        { headers: bursarHeaders }
      )
      console.log('✅ Bursar can access approved fees')
      console.log('Approved fees count:', approvedFeesResponse.data.length)

      const students = studentsResponse.data.data || studentsResponse.data
      if (students.length > 0 && approvedFeesResponse.data.length > 0) {
        const student = students[0]
        const fee = approvedFeesResponse.data[0]

        console.log(
          'Testing cash payment for:',
          student.firstname,
          student.lastname
        )
        console.log('Fee:', fee.name, '- Amount:', fee.amount)

        // Test cash payment
        const cashPaymentData = {
          user_id: student._id,
          fee_id: fee._id,
        }

        const cashPaymentResponse = await axios.post(
          'http://localhost:3000/api/v1/payment/pay-with-cash',
          cashPaymentData,
          { headers: bursarHeaders }
        )
        console.log('✅ Cash payment successful')
        console.log(
          'Payment response:',
          cashPaymentResponse.data.message || 'Payment processed'
        )
      }
    } catch (error) {
      console.log(
        '❌ Bursar cash payment test failed:',
        error.response?.data?.message || error.message
      )
    }

    console.log('\n🎉 Quick functionality testing completed!')
  } catch (error) {
    console.log(
      '❌ Test failed:',
      error.response?.data?.message || error.message
    )
    if (error.response?.data) {
      console.log('Full error response:', error.response.data)
    }
  }
})()
