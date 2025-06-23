const fs = require('fs')
const connectDB = require('./db/connection')

// Test the template generation directly
const { downloadStudentTemplate } = require('./controller/bulkStudentUpload')

async function testTemplate() {
  try {
    // Connect to database first
    await connectDB()
    console.log('Connected to database')

    // Mock request and response objects
    const mockReq = {
      user: {
        roles: ['ICT_administrator'],
        school: { _id: '676c5c2e4b0e8e7893f5b3cd' },
      },
      query: {
        school_id: '676c5c2e4b0e8e7893f5b3cd',
      },
    }

    const mockRes = {
      setHeader: (name, value) => {
        console.log(`Header: ${name} = ${value}`)
      },
      send: (buffer) => {
        console.log(`Response buffer size: ${buffer.length} bytes`)
        // Save the file to test
        fs.writeFileSync('test_template.xlsx', buffer)
        console.log('Template saved as test_template.xlsx')
        process.exit(0)
      },
      status: (code) => ({
        json: (data) => {
          console.log(`Error ${code}:`, data)
          process.exit(1)
        },
      }),
    }

    // Test the function
    console.log('Testing template download...')
    await downloadStudentTemplate(mockReq, mockRes)
  } catch (error) {
    console.error('Test error:', error)
    process.exit(1)
  }
}

testTemplate()
