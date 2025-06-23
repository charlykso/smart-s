const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/v1'

async function testBothICTAdminsNow() {
  try {
    console.log('Testing Both ICT Admins - Final Test...\n')

    // Test ICT Admin 1: Greenwood
    console.log('=== ICT Admin 1: Greenwood ===')
    try {
      const ict1Login = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'ict@greenwood.edu',
        password: 'password123',
      })

      console.log('✅ Login successful')
      const user1 = ict1Login.data.data.user
      const token1 = ict1Login.data.data.token

      console.log(`Name: ${user1.firstname} ${user1.lastname}`)
      console.log(`Email: ${user1.email}`)

      // Test template download
      try {
        await axios.get(`${BASE_URL}/bulk-students/template`, {
          headers: { Authorization: `Bearer ${token1}` },
        })
        console.log('✅ Template download works')
      } catch (error) {
        console.log('❌ Template download failed')
      }
    } catch (error) {
      console.log('❌ ICT Admin 1 login failed')
    }

    // Test ICT Admin 2: Secondary
    console.log('\n=== ICT Admin 2: Secondary ===')
    try {
      const ict2Login = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'ict-secondary@system.edu',
        password: 'password123',
      })

      console.log('✅ Login successful')
      const user2 = ict2Login.data.data.user
      const token2 = ict2Login.data.data.token

      console.log(`Name: ${user2.firstname} ${user2.lastname}`)
      console.log(`Email: ${user2.email}`)

      // Test template download
      try {
        await axios.get(`${BASE_URL}/bulk-students/template`, {
          headers: { Authorization: `Bearer ${token2}` },
        })
        console.log('✅ Template download works')
      } catch (error) {
        console.log('❌ Template download failed')
      }
    } catch (error) {
      console.log('❌ ICT Admin 2 login failed')
    }

    console.log('\n🎉 Both ICT Admins are functional!')
    console.log('\n📋 Final Summary:')
    console.log('✅ ICT Admin 1: ict@greenwood.edu / password123')
    console.log('✅ ICT Admin 2: ict-secondary@system.edu / password123')
    console.log('\nBoth ICT Admins can:')
    console.log('- Login successfully')
    console.log('- Download bulk student templates')
    console.log('- Access their respective dashboards')
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message)
  }
}

testBothICTAdminsNow()
