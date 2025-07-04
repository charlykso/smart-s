console.log('🏗️ Creating Payment Profile for Smart School Academy...\n')

async function createPaymentProfile() {
  try {
    // Step 1: Login as admin
    console.log('📡 Step 1: Login as admin...')
    const loginResponse = await fetch(
      'http://localhost:3000/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@smart-s.com',
          password: 'password123',
        }),
      }
    )

    const loginData = await loginResponse.json()

    if (!loginData.success || !loginData.data.token) {
      console.log('❌ Admin login failed:', loginData)
      return
    }

    const token = loginData.data.token
    console.log('✅ Admin login successful')

    // Step 2: Create payment profile
    console.log('\n📤 Step 2: Creating payment profile...')
    const profileData = {
      school_id: '6856ca374de0e2d916dc329c', // Smart School Academy ID from reference
      ps_public_key: 'pk_test_demo_paystack_public_key',
      ps_secret_key: 'sk_test_demo_paystack_secret_key',
      fw_public_key: 'FLWPUBK_TEST-demo_flutterwave_public_key',
      fw_secret_key: 'FLWSECK_TEST-demo_flutterwave_secret_key',
      account_no: '0123456789',
      account_name: 'Smart School Academy',
      bank_name: 'First Bank Nigeria',
    }

    const profileResponse = await fetch(
      'http://localhost:3000/api/v1/paymentProfile/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      }
    )

    const profileResult = await profileResponse.json()

    if (profileResponse.ok) {
      console.log('✅ Payment profile created successfully!')
    } else if (
      profileResult.error &&
      profileResult.error.includes('already exists')
    ) {
      console.log('⚠️  Payment profile already exists for this school')
    } else {
      console.log('❌ Failed to create payment profile:', profileResult)
      return
    }

    // Step 3: Test payment methods API
    console.log('\n🧪 Step 3: Testing payment methods API...')
    const methodsResponse = await fetch(
      'http://localhost:3000/api/v1/payment/available-methods/6856ca374de0e2d916dc329c',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const methodsData = await methodsResponse.json()

    if (methodsResponse.ok && methodsData.success) {
      console.log('✅ Payment methods API working!')
      console.log(`📊 Total available methods: ${methodsData.total}`)

      methodsData.data.forEach((method) => {
        console.log(
          `   ${method.enabled ? '✅' : '❌'} ${method.name}: ${
            method.description
          }`
        )
      })

      // Show student view (filtered)
      const studentMethods = methodsData.data.filter(
        (method) => method.method !== 'cash'
      )
      console.log(
        `\n🎓 Student will see ${studentMethods.length} online payment methods:`
      )
      studentMethods.forEach((method) => {
        console.log(`   💳 ${method.name}: ${method.description}`)
      })
    } else {
      console.log('❌ Payment methods API error:', methodsData)
    }

    console.log('\n✅ Payment profile integration test complete!')
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

createPaymentProfile()
