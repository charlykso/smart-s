const ExcelJS = require('exceljs')
const https = require('https')
const http = require('http')

// Helper function to download image from URL
const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http

    protocol
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`))
          return
        }

        const chunks = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => resolve(Buffer.concat(chunks)))
      })
      .on('error', reject)
  })
}

// Test ExcelJS with real image embedding
async function testExcelJSWithImage() {
  console.log('🧪 Testing ExcelJS with image embedding...')

  try {
    // Mock school data
    const mockSchool = {
      name: 'Greenwood High School',
      email: 'admin@greenwood.edu.ng',
      phoneNumber: '+2348123456789',
      groupSchool: {
        name: 'Greenwood Education Group',
        description: 'Excellence in Education Since 1995',
        logo: 'https://via.placeholder.com/150x75/0066CC/FFFFFF?text=LOGO', // Placeholder image for testing
      },
    }

    // Create new workbook and worksheet
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Students')

    let currentRow = 1

    // Try to download and embed the logo image
    try {
      console.log('📥 Downloading logo image...')
      const imageBuffer = await downloadImage(mockSchool.groupSchool.logo)
      console.log(`✅ Image downloaded: ${imageBuffer.length} bytes`)

      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      })

      // Add image to worksheet
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 }, // Top-left position
        ext: { width: 150, height: 75 }, // Image size
      })

      // Skip rows for the image
      currentRow = 4
      console.log('🖼️ Logo image embedded successfully')
    } catch (error) {
      console.log('⚠️ Could not embed logo image:', error.message)
      // Fall back to text
      worksheet.getCell(
        `A${currentRow}`
      ).value = `Logo: ${mockSchool.groupSchool.logo}`
      currentRow++
    }

    // Add group school name with styling
    const groupNameCell = worksheet.getCell(`A${currentRow}`)
    groupNameCell.value = mockSchool.groupSchool.name
    groupNameCell.font = { bold: true, size: 18, color: { argb: 'FF0066CC' } }
    groupNameCell.alignment = { horizontal: 'center' }
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    currentRow++

    // Add group school description
    if (mockSchool.groupSchool.description) {
      const descCell = worksheet.getCell(`A${currentRow}`)
      descCell.value = mockSchool.groupSchool.description
      descCell.font = { italic: true, size: 12 }
      descCell.alignment = { horizontal: 'center' }
      worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
      currentRow++
    }

    // Add separator
    currentRow++

    // Add school name
    const schoolNameCell = worksheet.getCell(`A${currentRow}`)
    schoolNameCell.value = mockSchool.name
    schoolNameCell.font = { bold: true, size: 16 }
    schoolNameCell.alignment = { horizontal: 'center' }
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    currentRow++

    // School contact info
    if (mockSchool.email) {
      worksheet.getCell(`A${currentRow}`).value = `Email: ${mockSchool.email}`
      currentRow++
    }
    if (mockSchool.phoneNumber) {
      worksheet.getCell(
        `A${currentRow}`
      ).value = `Phone: ${mockSchool.phoneNumber}`
      currentRow++
    }

    // Add spacing
    currentRow += 2

    // Add template title
    const titleCell = worksheet.getCell(`A${currentRow}`)
    titleCell.value = 'STUDENT BULK UPLOAD TEMPLATE'
    titleCell.font = { bold: true, size: 14 }
    titleCell.alignment = { horizontal: 'center' }
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    currentRow += 2

    // Define column headers
    const headers = [
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
    ]

    // Add headers with styling
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1)
      cell.value = header
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' },
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
    currentRow++

    // Add sample data
    const sampleData = [
      [
        'John',
        'Michael',
        'Doe',
        'john.doe@example.com',
        '+2348012345678',
        'STU001',
        'Male',
        '2005-01-15',
        'JSS 1',
        'day',
      ],
      [
        'Jane',
        'Mary',
        'Smith',
        'jane.smith@example.com',
        '+2348012345679',
        'STU002',
        'Female',
        '2005-03-20',
        'JSS 1',
        'boarding',
      ],
    ]

    sampleData.forEach((row) => {
      row.forEach((value, index) => {
        const cell = worksheet.getCell(currentRow, index + 1)
        cell.value = value
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
      currentRow++
    })

    // Set column widths
    const columnWidths = [15, 15, 15, 25, 15, 10, 8, 12, 10, 10]
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width
    })

    // Generate and save file
    const filename = `${mockSchool.name.replace(
      /[^a-zA-Z0-9]/g,
      '_'
    )}_students_exceljs.xlsx`
    await workbook.xlsx.writeFile(filename)

    console.log('✅ ExcelJS template generated successfully!')
    console.log(`📁 File saved as: ${filename}`)
    console.log('🎨 Features included:')
    console.log('   • Embedded logo image (if download successful)')
    console.log('   • Rich text formatting and colors')
    console.log('   • Cell borders and background colors')
    console.log('   • Merged cells for headers')
    console.log('   • Professional styling')
  } catch (error) {
    console.error('❌ Error testing ExcelJS:', error.message)
  }
}

// Run the test
testExcelJSWithImage()
