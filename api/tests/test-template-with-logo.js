const { downloadStudentTemplate } = require('./controller/bulkStudentUpload')

// Mock request and response objects
const mockReq = {
  query: {
    school_id: '6742d18ffabaa7065dd78d36', // Replace with actual school ID
  },
  user: {
    roles: ['Admin'],
    school: { _id: '6742d18ffabaa7065dd78d36' },
  },
}

const mockRes = {
  setHeader: (name, value) => {
    console.log(`Header set: ${name} = ${value}`)
  },
  send: (buffer) => {
    console.log(
      `Excel file generated successfully! Size: ${buffer.length} bytes`
    )

    // Save the file to test it
    const fs = require('fs')
    fs.writeFileSync('test_template_with_logo.xlsx', buffer)
    console.log('Template saved as test_template_with_logo.xlsx')
  },
  status: (code) => ({
    json: (data) => {
      console.log(`Error ${code}:`, data)
    },
  }),
}

// Test the function
console.log('Testing template download with group school logo...')
downloadStudentTemplate(mockReq, mockRes).catch(console.error)
