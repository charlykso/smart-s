const http = require('http')
const fs = require('fs')
require('dotenv').config()

// Helper function to make HTTP requests
function makeRequest(
  path,
  method = 'GET',
  data = null,
  token = null,
  expectBinary = false
) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData)
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`
    }

    const req = http.request(options, (res) => {
      let responseData = expectBinary ? Buffer.alloc(0) : ''

      res.on('data', (chunk) => {
        if (expectBinary) {
          responseData = Buffer.concat([responseData, chunk])
        } else {
          responseData += chunk
        }
      })

      res.on('end', () => {
        if (expectBinary) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            contentType: res.headers['content-type'],
          })
        } else {
          try {
            const parsed = JSON.parse(responseData)
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed)
            } else {
              reject({
                status: res.statusCode,
                message: parsed.message || 'Request failed',
                data: parsed,
              })
            }
          } catch (error) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              // Might be plain text response
              resolve({ data: responseData, status: res.statusCode })
            } else {
              reject({
                status: res.statusCode,
                message: 'Invalid JSON response',
                data: responseData,
              })
            }
          }
        }
      })
    })

    req.on('error', (error) => {
      reject({ message: error.message })
    })

    req.on('timeout', () => {
      req.destroy()
      reject({ message: 'Request timeout' })
    })

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

async function testICTAdminWorkflow() {
  try {
    console.log('🧪 Testing complete ICT Admin workflow...\n')

    // Step 1: Test ICT Admin login
    console.log('Step 1: Testing ICT Admin login...')
    const ictLoginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'ict@greenwood.edu',
      password: 'password123',
    })

    const ictToken = ictLoginResponse.data.token
    console.log('✅ ICT Admin login successful!')
    console.log('   ICT Admin details:', {
      id: ictLoginResponse.data.user._id,
      email: ictLoginResponse.data.user.email,
      roles: ictLoginResponse.data.user.roles,
      school: ictLoginResponse.data.user.school,
    })

    // Step 2: Test schools by group endpoint
    console.log('\nStep 2: Testing /schools/by-group endpoint...')
    try {
      const schoolsResponse = await makeRequest(
        '/schools/by-group',
        'GET',
        null,
        ictToken
      )
      console.log('✅ Schools endpoint works')
      console.log('   Schools found:', schoolsResponse.schools?.length || 0)
    } catch (error) {
      console.log('❌ Schools endpoint error:', error.message)
      console.log('   Status:', error.status)
    }

    // Step 3: Test managed schools users endpoint
    console.log('\nStep 3: Testing /users/managed-schools endpoint...')
    try {
      const usersResponse = await makeRequest(
        '/users/managed-schools',
        'GET',
        null,
        ictToken
      )
      console.log('✅ Users endpoint works')
      console.log('   Users found:', usersResponse.users?.length || 0)
    } catch (error) {
      console.log('❌ Users endpoint error:', error.message)
      console.log('   Status:', error.status)
    }

    // Step 4: Test template download (properly handle binary response)
    console.log('\nStep 4: Testing template download...')
    try {
      const templateResponse = await makeRequest(
        '/bulk-students/template',
        'GET',
        null,
        ictToken,
        true
      )

      if (templateResponse.status === 200) {
        console.log('✅ Template download successful!')
        console.log('   Response status:', templateResponse.status)
        console.log('   Content-Type:', templateResponse.contentType)
        console.log('   File size:', templateResponse.data.length, 'bytes')

        // Save the file to verify it's correct
        const filename = `test-template-${Date.now()}.xlsx`
        fs.writeFileSync(filename, templateResponse.data)
        console.log('   Template saved as:', filename)

        // Check if it's actually an Excel file by checking the first few bytes
        const header = templateResponse.data.slice(0, 4).toString('hex')
        if (header === '504b0304') {
          console.log('   ✅ Valid Excel file (ZIP format detected)')
        } else {
          console.log('   ⚠️  File format may not be Excel. Header:', header)
        }
      } else {
        console.log('❌ Template download failed')
        console.log('   Status:', templateResponse.status)
        console.log('   Content-Type:', templateResponse.contentType)
      }
    } catch (error) {
      console.log('❌ Template download error:', error.message)
      console.log('   Status:', error.status)
      if (error.data) {
        console.log(
          '   Response data (first 200 chars):',
          error.data.toString().substring(0, 200)
        )
      }
    }

    // Step 5: Test bulk upload endpoint (without file, just to see if it's accessible)
    console.log('\nStep 5: Testing bulk upload endpoint access...')
    try {
      const uploadResponse = await makeRequest(
        '/bulk-students/upload',
        'POST',
        {},
        ictToken
      )
      console.log(
        '✅ Upload endpoint accessible (expected to fail without file)'
      )
    } catch (error) {
      if (error.status === 400) {
        console.log('✅ Upload endpoint accessible (correctly requires file)')
        console.log('   Error message:', error.message)
      } else {
        console.log('❌ Upload endpoint error:', error.message)
        console.log('   Status:', error.status)
      }
    }

    console.log('\n🎉 ICT Admin workflow testing completed!')
    console.log('\n📋 Summary:')
    console.log('   - ICT Admin login: Working ✅')
    console.log('   - Schools endpoint: Check results above')
    console.log('   - Users endpoint: Check results above')
    console.log('   - Template download: Check results above')
    console.log('   - Upload endpoint: Check results above')
  } catch (error) {
    console.error('\n❌ Workflow test failed:')
    console.error('Error:', error.message)
    if (error.data) {
      console.error('Details:', error.data)
    }
  }
}

testICTAdminWorkflow()
