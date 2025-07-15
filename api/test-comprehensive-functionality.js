// Test comprehensive functionality: Student payments, Bursar cash payments, Principal fee approval
const axios = require('axios')

;(async () => {
  console.log('🔧 Testing Comprehensive Functionality...\n')

  try {
    // Test 1: Principal Login and Fee Approval
    console.log('👨‍💼 Test 1: Principal Fee Approval...')

    const principalLoginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'principal@smartschool.edu',
        password: 'password123',
      }
    )

    const principalToken = principalLoginResponse.data.data.token
    const principal = principalLoginResponse.data.data.user
    console.log('✅ Principal Login Success')
    console.log('Principal:', principal.firstname, principal.lastname)
    console.log('School:', principal.school?.name || 'No school')
    console.log('')

    const principalHeaders = { Authorization: `Bearer ${principalToken}` }

    // Get unapproved fees
    try {
      const unapprovedFeesResponse = await axios.get(
        'http://localhost:3000/api/v1/fee/get-unapproved-fees',
        { headers: principalHeaders }
      )
      console.log('✅ Principal can access unapproved fees')
      console.log('Unapproved fees count:', unapprovedFeesResponse.data.length)

      if (unapprovedFeesResponse.data.length > 0) {
        const feeToApprove = unapprovedFeesResponse.data[0]
        console.log('Fee to approve:', feeToApprove.name)

        // Try to approve the fee
        const approveResponse = await axios.put(
          `http://localhost:3000/api/v1/approve/${feeToApprove._id}/approve`,
          {},
          { headers: principalHeaders }
        )
        console.log('✅ Principal can approve fees')
        console.log(
          'Approval response:',
          approveResponse.data.message || 'Fee approved'
        )
      } else {
        console.log('ℹ️ No unapproved fees found to test approval')
      }
    } catch (error) {
      console.log(
        '❌ Principal fee approval failed:',
        error.response?.data?.message || error.message
      )
    }

    // Test 2: Bursar Login and Cash Payment
    console.log('\n💰 Test 2: Bursar Cash Payment...')

    const bursarLoginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'bursar@smart-s.com',
        password: 'password123',
      }
    )

    const bursarToken = bursarLoginResponse.data.data.token
    const bursar = bursarLoginResponse.data.data.user
    console.log('✅ Bursar Login Success')
    console.log('Bursar:', bursar.firstname, bursar.lastname)
    console.log('School:', bursar.school?.name || 'No school')
    console.log('')

    const bursarHeaders = { Authorization: `Bearer ${bursarToken}` }

    // Get approved fees for cash payment
    try {
      const approvedFeesResponse = await axios.get(
        'http://localhost:3000/api/v1/fee/get-approved-fees',
        { headers: bursarHeaders }
      )
      console.log('✅ Bursar can access approved fees')
      console.log('Approved fees count:', approvedFeesResponse.data.length)

      if (approvedFeesResponse.data.length > 0) {
        const feeForPayment = approvedFeesResponse.data[0]
        console.log('Fee for cash payment:', feeForPayment.name)

        // Get students for this fee's term
        const studentsResponse = await axios.get(
          'http://localhost:3000/api/v1/user/student/all',
          { headers: bursarHeaders }
        )

        if (studentsResponse.data.length > 0) {
          const student = studentsResponse.data[0]
          console.log(
            'Student for payment:',
            student.firstname,
            student.lastname
          )

          // Try to process cash payment
          const cashPaymentData = {
            user_id: student._id,
            fee_id: feeForPayment._id,
          }

          const cashPaymentResponse = await axios.post(
            'http://localhost:3000/api/v1/payment/pay-with-cash',
            cashPaymentData,
            { headers: bursarHeaders }
          )
          console.log('✅ Bursar can process cash payments')
          console.log(
            'Payment response:',
            cashPaymentResponse.data.message || 'Payment processed'
          )
        } else {
          console.log('ℹ️ No students found to test cash payment')
        }
      } else {
        console.log('ℹ️ No approved fees found to test cash payment')
      }
    } catch (error) {
      console.log(
        '❌ Bursar cash payment failed:',
        error.response?.data?.message || error.message
      )
    }

    // Test 3: Student Login and Payment View
    console.log('\n🎓 Test 3: Student Payment View...')

    const studentLoginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'test1752484620719@example.com',
        password: 'password123',
      }
    )

    const studentToken = studentLoginResponse.data.data.token
    const student = studentLoginResponse.data.data.user
    console.log('✅ Student Login Success')
    console.log('Student:', student.firstname, student.lastname)
    console.log('School:', student.school?.name || 'No school')
    console.log('')

    const studentHeaders = { Authorization: `Bearer ${studentToken}` }

    // Get student's approved fees
    try {
      const studentFeesResponse = await axios.get(
        'http://localhost:3000/api/v1/fee/student/approved-fees',
        { headers: studentHeaders }
      )
      console.log('✅ Student can access their fees')
      console.log('Student fees count:', studentFeesResponse.data.length)

      if (studentFeesResponse.data.length > 0) {
        const studentFee = studentFeesResponse.data[0]
        console.log('Student fee:', studentFee.name)
        console.log('Fee amount:', studentFee.amount)
        console.log('Fee approved:', studentFee.isApproved)

        // Check if student can see payment methods
        const schoolId = student.school?._id || student.school
        const paymentMethodsResponse = await axios.get(
          `http://localhost:3000/api/v1/payment/available-methods/${schoolId}`,
          { headers: studentHeaders }
        )
        console.log('✅ Student can access payment methods')
        console.log(
          'Available payment methods:',
          paymentMethodsResponse.data.length
        )
      } else {
        console.log('ℹ️ No fees found for student')
      }
    } catch (error) {
      console.log(
        '❌ Student fee access failed:',
        error.response?.data?.message || error.message
      )
    }

    // Test 4: Check Payment History
    console.log('\n📊 Test 4: Payment History...')

    try {
      const paymentHistoryResponse = await axios.get(
        'http://localhost:3000/api/v1/payment/all',
        { headers: bursarHeaders }
      )
      console.log('✅ Payment history accessible')
      console.log('Total payments:', paymentHistoryResponse.data.length)

      if (paymentHistoryResponse.data.length > 0) {
        const recentPayment = paymentHistoryResponse.data[0]
        console.log(
          'Recent payment:',
          recentPayment.amount,
          recentPayment.status
        )
      }
    } catch (error) {
      console.log(
        '❌ Payment history access failed:',
        error.response?.data?.message || error.message
      )
    }

    console.log('\n🎉 Comprehensive functionality testing completed!')
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
