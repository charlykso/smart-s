const ExcelJS = require('exceljs')
const fs = require('fs')

// Test ExcelJS with a simple local image (we'll create a simple PNG)
async function testWithLocalImage() {
  console.log('🧪 Testing ExcelJS with local placeholder image...')

  try {
    // Create a simple 1x1 transparent PNG as a placeholder
    const simplePNG = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ])

    // Save placeholder image
    fs.writeFileSync('placeholder-logo.png', simplePNG)

    // Mock school data
    const mockSchool = {
      name: 'Greenwood High School',
      email: 'admin@greenwood.edu.ng',
      phoneNumber: '+2348123456789',
      groupSchool: {
        name: 'Greenwood Education Group',
        description: 'Excellence in Education Since 1995',
        logo: './placeholder-logo.png',
      },
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Students')

    let currentRow = 1

    // Add local image
    try {
      const imageBuffer = fs.readFileSync(mockSchool.groupSchool.logo)
      console.log(`✅ Local image loaded: ${imageBuffer.length} bytes`)

      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      })

      // Add image to worksheet
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 100, height: 50 }, // Smaller size for placeholder
      })

      currentRow = 3
      console.log('🖼️ Local placeholder image embedded successfully')
    } catch (error) {
      console.log('⚠️ Could not embed local image:', error.message)
    }

    // Add group school name with rich formatting
    const groupNameCell = worksheet.getCell(`A${currentRow}`)
    groupNameCell.value = mockSchool.groupSchool.name
    groupNameCell.font = { bold: true, size: 18, color: { argb: 'FF0066CC' } }
    groupNameCell.alignment = { horizontal: 'center' }
    groupNameCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F8FF' },
    }
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    currentRow++

    // Add description with styling
    const descCell = worksheet.getCell(`A${currentRow}`)
    descCell.value = mockSchool.groupSchool.description
    descCell.font = { italic: true, size: 12, color: { argb: 'FF4169E1' } }
    descCell.alignment = { horizontal: 'center' }
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    currentRow += 2

    // Add school name with different styling
    const schoolNameCell = worksheet.getCell(`A${currentRow}`)
    schoolNameCell.value = mockSchool.name
    schoolNameCell.font = { bold: true, size: 16, color: { argb: 'FF2E8B57' } }
    schoolNameCell.alignment = { horizontal: 'center' }
    schoolNameCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5FFFA' },
    }
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    currentRow++

    // Contact info with icons (using text symbols)
    worksheet.getCell(`A${currentRow}`).value = `📧 Email: ${mockSchool.email}`
    currentRow++
    worksheet.getCell(
      `A${currentRow}`
    ).value = `📞 Phone: ${mockSchool.phoneNumber}`
    currentRow += 2

    // Template title with background
    const titleCell = worksheet.getCell(`A${currentRow}`)
    titleCell.value = '📚 STUDENT BULK UPLOAD TEMPLATE'
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
    titleCell.alignment = { horizontal: 'center' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4169E1' },
    }
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
    currentRow += 2

    // Headers with gradient-like effect
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

    headers.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1)
      cell.value = header.charAt(0).toUpperCase() + header.slice(1)
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6495ED' },
      }
      cell.alignment = { horizontal: 'center' }
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'medium', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        right: { style: 'medium', color: { argb: 'FF000000' } },
      }
    })
    currentRow++

    // Sample data with alternating row colors
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

    sampleData.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const cell = worksheet.getCell(currentRow, colIndex + 1)
        cell.value = value

        // Alternating row colors
        const bgColor = rowIndex % 2 === 0 ? 'FFF0F8FF' : 'FFFFFFFF'
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor },
        }

        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
        cell.alignment = { horizontal: 'center' }
      })
      currentRow++
    })

    // Set column widths
    const columnWidths = [15, 15, 15, 25, 15, 10, 8, 12, 10, 10]
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width
    })

    // Save file
    const filename = `${mockSchool.name.replace(
      /[^a-zA-Z0-9]/g,
      '_'
    )}_students_professional.xlsx`
    await workbook.xlsx.writeFile(filename)

    console.log('✅ Professional ExcelJS template created!')
    console.log(`📁 File saved as: ${filename}`)
    console.log('🎨 Enhanced features:')
    console.log('   • Embedded placeholder image')
    console.log('   • Rich colors and gradients')
    console.log('   • Professional typography')
    console.log('   • Alternating row colors')
    console.log('   • Emoji icons for visual appeal')
    console.log('   • Merged cells and borders')

    // Clean up placeholder image
    fs.unlinkSync('placeholder-logo.png')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testWithLocalImage()
