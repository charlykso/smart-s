#!/usr/bin/env node

console.log('🏗️ Creating Payment Profile for Smart School Academy...\n')

const createPaymentProfile = async () => {
  const jwt = require('jsonwebtoken')

  // Generate admin token
  const adminPayload = {
    userId: '507f1f77bcf86cd799439011',
    role: 'Admin',
  }
  const adminToken = jwt.sign(
    adminPayload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  )

  // Sample payment profile data for Smart School Academy
  const paymentProfileData = {
    school_id: '507f1f77bcf86cd799439012', // Smart School Academy ID

    // Paystack (Test Keys)
    ps_public_key: 'pk_test_demo_paystack_public_key',
    ps_secret_key: 'sk_test_demo_paystack_secret_key',

    // Flutterwave (Test Keys)
    fw_public_key: 'FLWPUBK_TEST-demo_flutterwave_public_key',
    fw_secret_key: 'FLWSECK_TEST-demo_flutterwave_secret_key',

    // Bank Transfer Details
    account_no: '0123456789',
    account_name: 'Smart School Academy',
    bank_name: 'First Bank Nigeria',
  }

  try {
    console.log('📤 Creating payment profile...')

    const response = await fetch(
      'http://localhost:3000/api/v1/paymentProfile/create',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentProfileData),
      }
    )

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Payment profile created successfully!')
      console.log('📋 Profile Details:')
      console.log(`   School ID: ${paymentProfileData.school_id}`)
      console.log(
        `   Paystack: ${
          paymentProfileData.ps_public_key ? 'Configured' : 'Not configured'
        }`
      )
      console.log(
        `   Flutterwave: ${
          paymentProfileData.fw_public_key ? 'Configured' : 'Not configured'
        }`
      )
      console.log(
        `   Bank Transfer: ${paymentProfileData.account_no} (${paymentProfileData.bank_name})`
      )

      // Now test the payment methods API
      console.log('\n🧪 Testing payment methods API with new profile...')
      await testPaymentMethodsAPI(adminToken)
    } else {
      if (result.error && result.error.includes('already exists')) {
        console.log('⚠️  Payment profile already exists for this school')
        console.log('🔄 Testing existing profile...')
        await testPaymentMethodsAPI(adminToken)
      } else {
        console.log('❌ Failed to create payment profile:')
        console.log(JSON.stringify(result, null, 2))
      }
    }
  } catch (error) {
    console.log('❌ Error creating payment profile:', error.message)
  }
}

const testPaymentMethodsAPI = async (token) => {
  try {
    console.log(
      '📡 Calling /api/v1/payment/available-methods/507f1f77bcf86cd799439012...'
    )

    const response = await fetch(
      'http://localhost:3000/api/v1/payment/available-methods/507f1f77bcf86cd799439012',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (response.ok && data.success) {
      console.log('✅ Payment methods API working!')
      console.log(`📊 Available methods: ${data.total}`)

      data.data.forEach((method) => {
        console.log(
          `   ${method.enabled ? '✅' : '❌'} ${method.name}: ${
            method.description
          }`
        )
      })

      // Test student view (filter out cash)
      const studentMethods = data.data.filter(
        (method) => method.method !== 'cash'
      )
      console.log(
        `\n🎓 Student will see ${studentMethods.length} online payment methods:`
      )
      studentMethods.forEach((method) => {
        console.log(`   💳 ${method.name}: ${method.description}`)
      })
    } else {
      console.log('❌ Payment methods API error:')
      console.log(JSON.stringify(data, null, 2))
    }
  } catch (error) {
    console.log('❌ Error testing payment methods API:', error.message)
  }
}

// Run the test
createPaymentProfile()
