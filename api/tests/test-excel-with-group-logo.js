const XLSX = require('xlsx')

// Simulate school and group school data
const mockSchool = {
  name: 'Greenwood High School',
  email: 'admin@greenwood.edu.ng',
  phoneNumber: '+2348123456789',
  groupSchool: {
    name: 'Greenwood Education Group',
    description: 'Excellence in Education Since 1995',
    logo: 'https://example.com/greenwood-logo.png',
  },
}

// Test Excel generation with group school logo
console.log(
  'Testing Excel template generation with group school information...'
)

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

  // Create worksheet with school and group school information at the top
  const worksheet = XLSX.utils.aoa_to_sheet([])

  let currentRow = 0

  // Add group school information
  if (mockSchool.groupSchool) {
    // Add group school name
    XLSX.utils.sheet_add_aoa(worksheet, [[mockSchool.groupSchool.name]], {
      origin: `A${currentRow + 1}`,
    })
    currentRow += 1

    // Add group school logo URL
    if (mockSchool.groupSchool.logo) {
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [[`Logo: ${mockSchool.groupSchool.logo}`]],
        { origin: `A${currentRow + 1}` }
      )
      currentRow += 1
    }

    // Add group school description
    if (mockSchool.groupSchool.description) {
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [[mockSchool.groupSchool.description]],
        { origin: `A${currentRow + 1}` }
      )
      currentRow += 1
    }

    // Add separator line
    XLSX.utils.sheet_add_aoa(worksheet, [['---']], {
      origin: `A${currentRow + 1}`,
    })
    currentRow += 1
  }

  // Add school name
  XLSX.utils.sheet_add_aoa(worksheet, [[mockSchool.name]], {
    origin: `A${currentRow + 1}`,
  })
  currentRow += 1

  // Add school email
  if (mockSchool.email) {
    XLSX.utils.sheet_add_aoa(worksheet, [[`Email: ${mockSchool.email}`]], {
      origin: `A${currentRow + 1}`,
    })
    currentRow += 1
  }

  // Add school phone
  if (mockSchool.phoneNumber) {
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [[`Phone: ${mockSchool.phoneNumber}`]],
      { origin: `A${currentRow + 1}` }
    )
    currentRow += 1
  }

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

  // Style the group school name and school name rows
  let styleRow = 1
  if (mockSchool.groupSchool) {
    // Style group school name (first row)
    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, sz: 18, color: { rgb: '0066CC' } },
        alignment: { horizontal: 'center' },
      }
    }
    // Find school name row (after group school info)
    styleRow = mockSchool.groupSchool.description ? 5 : 4
    if (mockSchool.groupSchool.logo) styleRow++
  }

  // Style school name
  const schoolNameCell = `A${styleRow}`
  if (worksheet[schoolNameCell]) {
    worksheet[schoolNameCell].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: 'center' },
    }
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

  // Generate buffer and save file
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  // Save the file
  const fs = require('fs')
  const filename = `${mockSchool.name.replace(
    /[^a-zA-Z0-9]/g,
    '_'
  )}_students.xlsx`
  fs.writeFileSync(filename, buffer)

  console.log(`✅ Template generated successfully!`)
  console.log(`📁 File saved as: ${filename}`)
  console.log(`📊 File size: ${buffer.length} bytes`)
  console.log(`\n🏫 Template includes:`)
  console.log(`   • Group School: ${mockSchool.groupSchool.name}`)
  console.log(`   • Group Logo: ${mockSchool.groupSchool.logo}`)
  console.log(`   • School: ${mockSchool.name}`)
  console.log(`   • Contact: ${mockSchool.email}`)
  console.log(`   • Phone: ${mockSchool.phoneNumber}`)
} catch (error) {
  console.error('❌ Error generating template:', error.message)
}
