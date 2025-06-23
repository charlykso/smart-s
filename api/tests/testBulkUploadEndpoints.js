const axios = require('axios')

async function testBulkUploadEndpoints() {
  try {
    console.log('🔐 Logging in as admin...')

    // Login to get token
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'admin@ledgrio.com',
        password: 'password123',
      }
    )

    const token = loginResponse.data.data.token
    console.log('✅ Login successful, token received')

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }

    console.log('\n📋 Testing bulk upload endpoints...')

    // Test 1: Download template endpoint
    try {
      console.log('\n1. Testing GET /api/v1/bulk-students/template')
      const templateResponse = await axios.get(
        'http://localhost:3000/api/v1/bulk-students/template',
        config
      )
      console.log(
        '✅ Template endpoint response status:',
        templateResponse.status
      )
      console.log(
        '✅ Template endpoint working - content type:',
        templateResponse.headers['content-type']
      )
    } catch (error) {
      console.log(
        '❌ Template endpoint error:',
        error.response?.data || error.message
      )
    }

    // Test 2: Upload endpoint (without file - should give error about missing file)
    try {
      console.log('\n2. Testing POST /api/v1/bulk-students/upload (no file)')
      const uploadResponse = await axios.post(
        'http://localhost:3000/api/v1/bulk-students/upload',
        {},
        config
      )
      console.log('✅ Upload endpoint response:', uploadResponse.data)
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(
          '✅ Upload endpoint correctly rejects missing file:',
          error.response.data
        )
      } else {
        console.log(
          '❌ Upload endpoint error:',
          error.response?.data || error.message
        )
      }
    }

    console.log('\n🎉 Bulk upload endpoints testing completed!')
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message)
  }
}

testBulkUploadEndpoints()
