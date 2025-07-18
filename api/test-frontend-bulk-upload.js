// Test the exact same request that the frontend is making
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

;(async () => {
  console.log('🔧 Testing Frontend Bulk Upload Request...\n')

  try {
    // Login as ICT Admin (same as frontend)
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'ict@greenwood.edu',
        password: 'password123',
      }
    )

    const token = loginResponse.data.data.token
    console.log('✅ ICT Admin Login Success')
    console.log('')

    // Create a test Excel file (same as our previous tests)
    const ExcelJS = require('exceljs')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Students')

    // Add some empty rows first (to simulate real Excel files)
    for (let i = 1; i <= 13; i++) {
      worksheet.addRow([])
    }

    // Add header row at row 14 (same as detected in logs)
    worksheet.addRow([
      'firstname',
      'middlename',
      'lastname',
      'email',
      'phone',
      'regNo',
      'gender',
      'DOB',
      'classArm',
      'type',
    ])

    // Add test data with unique identifiers (type must be 'day' or 'boarding')
    const timestamp = Date.now()
    worksheet.addRow([
      'John',
      'Middle',
      'Doe',
      `john.doe.${timestamp}@example.com`,
      '1234567890',
      `REG${timestamp}1`,
      'Male',
      '2000-01-01',
      'SSS3A',
      'day',
    ])
    worksheet.addRow([
      'Jane',
      'M',
      'Smith',
      `jane.smith.${timestamp}@example.com`,
      '0987654321',
      `REG${timestamp}2`,
      'Female',
      '2000-02-01',
      'SSS1B',
      'boarding',
    ])

    const testFilePath = './test-frontend-upload.xlsx'
    await workbook.xlsx.writeFile(testFilePath)
    console.log('✅ Test Excel file created')

    // Create FormData exactly like the frontend
    const formData = new FormData()
    formData.append('file', fs.createReadStream(testFilePath))
    formData.append('school_id', '68710d460f09d66cf283b298') // Greenwood School ID

    console.log('📤 Making bulk upload request...')
    console.log('URL: http://localhost:3000/api/v1/bulk-students/upload')
    console.log('School ID: 68710d460f09d66cf283b298')
    console.log('')

    // Make the exact same request as frontend
    const response = await axios.post(
      'http://localhost:3000/api/v1/bulk-students/upload',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
        responseType: 'arraybuffer', // To handle PDF response
        validateStatus: function (status) {
          return status < 500 // Don't throw for 4xx errors
        },
      }
    )

    console.log('📥 Response received:')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    console.log('Content-Type:', response.headers['content-type'])
    console.log('Content-Length:', response.headers['content-length'])
    console.log('')

    if (response.status === 200) {
      console.log('✅ Upload successful!')

      if (response.headers['content-type']?.includes('application/pdf')) {
        console.log('✅ PDF response received')

        // Save the PDF to verify it's valid
        fs.writeFileSync('./test-upload-result.pdf', response.data)
        console.log('✅ PDF saved as test-upload-result.pdf')

        // Check PDF size
        const stats = fs.statSync('./test-upload-result.pdf')
        console.log('PDF size:', stats.size, 'bytes')

        if (stats.size > 1000) {
          console.log('✅ PDF appears to be valid (size > 1KB)')
        } else {
          console.log('⚠️ PDF might be corrupted (size < 1KB)')
        }
      } else {
        console.log('Response content type:', response.headers['content-type'])
        console.log(
          'Response data (first 500 chars):',
          response.data.toString().substring(0, 500)
        )
      }
    } else {
      console.log('❌ Upload failed')
      console.log('Response data:', response.data.toString())
    }

    // Cleanup
    fs.unlinkSync(testFilePath)
    if (fs.existsSync('./test-upload-result.pdf')) {
      console.log('')
      console.log('🎉 Test completed successfully! PDF credentials generated.')
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message)

    if (error.response) {
      console.log('Error status:', error.response.status)
      console.log('Error headers:', error.response.headers)
      console.log(
        'Error data:',
        error.response.data?.toString().substring(0, 500)
      )
    }
  }
})()
