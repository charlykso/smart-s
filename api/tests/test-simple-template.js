const XLSX = require('xlsx')
const fs = require('fs')

console.log('Testing XLSX library...')

try {
  // Create sample data for the template
  const templateData = [
    {
      firstname: 'John',
      middlename: 'Michael',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      phone: '+2348012345678',
      regNo: 'STU001',
      gender: 'Male',
      DOB: '2005-01-15',
      classArm: 'JSS 1',
      type: 'day',
    },
    {
      firstname: 'Jane',
      middlename: 'Mary',
      lastname: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+2348012345679',
      regNo: 'STU002',
      gender: 'Female',
      DOB: '2005-03-20',
      classArm: 'JSS 1',
      type: 'boarding',
    },
  ]

  // Create workbook
  const workbook = XLSX.utils.book_new()

  // Create worksheet with school information at the top
  const worksheet = XLSX.utils.aoa_to_sheet([])

  let currentRow = 0

  // Add school information at the top
  const schoolName = 'TEST SCHOOL'
  const schoolAddress = '123 Test Street, Test City'
  const schoolPhone = '+2348012345678'

  // Add school name
  XLSX.utils.sheet_add_aoa(worksheet, [[schoolName]], {
    origin: `A${currentRow + 1}`,
  })
  currentRow += 1

  // Add school address
  XLSX.utils.sheet_add_aoa(worksheet, [[schoolAddress]], {
    origin: `A${currentRow + 1}`,
  })
  currentRow += 1

  // Add school phone
  XLSX.utils.sheet_add_aoa(worksheet, [[`Phone: ${schoolPhone}`]], {
    origin: `A${currentRow + 1}`,
  })
  currentRow += 1

  // Add empty row for separation
  currentRow += 1

  // Add title
  XLSX.utils.sheet_add_aoa(worksheet, [['STUDENT BULK UPLOAD TEMPLATE']], {
    origin: `A${currentRow + 1}`,
  })
  currentRow += 1

  // Add empty row
  currentRow += 1

  // Add template data starting from the appropriate row
  const templateRange = XLSX.utils.json_to_sheet(templateData)
  const templateAoa = XLSX.utils.sheet_to_json(templateRange, { header: 1 })

  XLSX.utils.sheet_add_aoa(worksheet, templateAoa, {
    origin: `A${currentRow + 1}`,
  })

  // Set column widths for better readability
  const columnWidths = [
    { wch: 15 }, // firstname
    { wch: 15 }, // middlename
    { wch: 15 }, // lastname
    { wch: 25 }, // email
    { wch: 15 }, // phone
    { wch: 10 }, // regNo
    { wch: 8 }, // gender
    { wch: 12 }, // DOB
    { wch: 10 }, // classArm
    { wch: 10 }, // type
  ]
  worksheet['!cols'] = columnWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  // Save to file
  fs.writeFileSync('simple_test_template.xlsx', buffer)
  console.log('Simple template created successfully: simple_test_template.xlsx')
  console.log(`File size: ${buffer.length} bytes`)
} catch (error) {
  console.error('Error creating template:', error)
}
