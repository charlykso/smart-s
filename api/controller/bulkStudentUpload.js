const XLSX = require('xlsx')
const ExcelJS = require('exceljs')
const bcrypt = require('bcryptjs')
const User = require('../model/User')
const Profile = require('../model/Profile')
const Address = require('../model/Address')
const ClassArm = require('../model/ClassArm')
const School = require('../model/School')
const { generateStudentCredentialsPDF } = require('../utils/pdfGenerator')
const fs = require('fs')
const path = require('path')
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

// Helper function to auto-update class arm student count
const autoUpdateClassArmStudentCount = async (classArmId, options = {}) => {
  try {
    const studentCount = await User.countDocuments({
      classArm: classArmId,
      roles: 'Student',
    })

    await ClassArm.findByIdAndUpdate(classArmId, {
      totalNumberOfStudents: studentCount,
    })

    if (!options.silent) {
      console.log(
        `Updated class arm ${classArmId} student count to ${studentCount}`
      )
    }
  } catch (error) {
    console.error('Error updating class arm student count:', error)
  }
}

// Validate Excel data
const validateStudentData = (student, rowIndex) => {
  const errors = []
  const requiredFields = [
    'firstname',
    'lastname',
    'regNo',
    'gender',
    'classArm',
    'type',
  ]

  // Check required fields
  requiredFields.forEach((field) => {
    if (
      !student[field] ||
      (student[field] && student[field].toString().trim() === '')
    ) {
      errors.push(`Row ${rowIndex}: ${field} is required`)
    }
  })

  // Validate email format (only if provided and not empty)
  if (
    student.email &&
    typeof student.email === 'string' &&
    student.email.trim() !== '' &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email.trim())
  ) {
    errors.push(`Row ${rowIndex}: Invalid email format`)
  }

  // Validate gender
  if (student.gender && !['Male', 'Female'].includes(student.gender)) {
    errors.push(`Row ${rowIndex}: Gender must be 'Male' or 'Female'`)
  }

  // Validate type
  if (student.type && !['day', 'boarding'].includes(student.type)) {
    errors.push(`Row ${rowIndex}: Type must be 'day' or 'boarding'`)
  }

  // Validate phone number (only if provided and not empty)
  if (
    student.phone &&
    typeof student.phone === 'string' &&
    student.phone.trim() !== '' &&
    !/^\+?[\d\s\-()]+$/.test(student.phone.trim())
  ) {
    errors.push(`Row ${rowIndex}: Invalid phone number format`)
  }

  return errors
}

// Generate default email and phone for students
const generateDefaultContactInfo = (student, rowIndex) => {
  // Ensure student object exists
  if (!student) {
    return student
  }

  // Generate default email if not provided or empty
  const emailEmpty =
    !student.email ||
    student.email === null ||
    student.email === undefined ||
    (typeof student.email === 'string' && student.email.trim() === '')

  if (emailEmpty) {
    const cleanRegNo = (student.regNo || '')
      .toString()
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
    student.email = `${cleanRegNo || 'student'}@student.ledgrio.com`
  }

  // Generate default phone if not provided or empty
  const phoneEmpty =
    !student.phone ||
    student.phone === null ||
    student.phone === undefined ||
    (typeof student.phone === 'string' && student.phone.trim() === '')

  if (phoneEmpty) {
    // Generate a default phone number using row index to ensure uniqueness
    const paddedIndex = String(rowIndex || 1).padStart(4, '0')
    student.phone = `+234800${paddedIndex}`
  }

  return student
}

// Configuration for bulk upload
const BULK_UPLOAD_CONFIG = {
  // Password generation method: 'regNoYear', 'regNo', 'phone', or 'legacy'
  // 'regNoYear' - Uses regNo + current year (e.g., REG123_2025)
  // 'regNo' - Uses student registration number as password
  // 'phone' - Uses phone number (digits only) as password
  // 'legacy' - Uses firstname + last 3 digits of regNo + year
  passwordType: 'regNoYear', // Changed to use regNo + year
}

// Generate default password - updated to use regNo + year
const generateDefaultPassword = (
  studentData,
  passwordType = BULK_UPLOAD_CONFIG.passwordType
) => {
  const currentYear = new Date().getFullYear()

  switch (passwordType) {
    case 'regNoYear':
      // Use registration number + current year
      return `${studentData.regNo}_${currentYear}`
    case 'phone':
      // Use phone number as password (remove any non-digits) - only if phone exists
      return studentData.phone
        ? studentData.phone.replace(/\D/g, '')
        : `${studentData.regNo}_${currentYear}`
    case 'regNo':
      // Use registration number as password
      return studentData.regNo
    case 'legacy':
      // Original method: firstname + last 3 digits of regNo + year
      return `${studentData.firstname.toLowerCase()}${studentData.regNo.slice(
        -3
      )}${currentYear}`
    default:
      // Default to regNo + year for security
      return `${studentData.regNo}_${currentYear}`
  }
}

// Smart header detection function
const findHeaderRow = (worksheet) => {
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  const expectedHeaders = [
    'firstname',
    'lastname',
    'regNo',
    'gender',
    'classArm',
    'type',
  ]

  // Check each row to find the one that contains our expected headers
  for (let r = 0; r <= range.e.r; r++) {
    const rowData = []
    for (let c = 0; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c })
      const cell = worksheet[cellAddress]
      rowData.push(cell ? cell.v : '')
    }

    // Check if this row contains most of our expected headers
    const matchingHeaders = expectedHeaders.filter((header) =>
      rowData.some(
        (cell) =>
          typeof cell === 'string' &&
          cell.toLowerCase().trim() === header.toLowerCase()
      )
    )

    // If we find at least 4 of the 6 required headers, this is likely our header row
    if (matchingHeaders.length >= 4) {
      console.log(`Found header row at row ${r + 1} with headers:`, rowData)
      return r
    }
  }

  // If no clear header row found, assume first row (default behavior)
  console.log('No clear header row found, using first row as default')
  return 0
}

// Smart Excel parsing function
const parseExcelWithHeaderDetection = (worksheet) => {
  const headerRowIndex = findHeaderRow(worksheet)

  // If header row is 0, use default parsing
  if (headerRowIndex === 0) {
    return XLSX.utils.sheet_to_json(worksheet)
  }

  // Otherwise, parse starting from the detected header row
  const range = XLSX.utils.decode_range(worksheet['!ref'])

  // Create a new range starting from the header row
  const newRange = {
    s: { c: range.s.c, r: headerRowIndex },
    e: { c: range.e.c, r: range.e.r },
  }

  // Convert to JSON using the adjusted range
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    range: newRange,
  })

  console.log(
    `Parsed ${jsonData.length} rows starting from header row ${
      headerRowIndex + 1
    }`
  )
  return jsonData
}

// Process Excel file and create students
exports.bulkUploadStudents = async (req, res) => {
  try {
    const { school_id } = req.body

    // Validate school_id
    if (!school_id) {
      return res.status(400).json({
        success: false,
        message: 'School ID is required',
      })
    }

    // Verify school exists and user has access
    const school = await School.findById(school_id).populate('groupSchool')
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found',
      })
    }

    // Check if user has access to this school (unless Admin)
    if (!req.user.roles.includes('Admin')) {
      const userSchool = req.user.school?._id || req.user.school
      if (userSchool.toString() !== school_id) {
        return res.status(403).json({
          success: false,
          message:
            'Access denied - you can only upload students to your own school',
        })
      }
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is required',
      })
    }

    // Read Excel file with smart header detection
    const workbook = XLSX.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = parseExcelWithHeaderDetection(worksheet)

    if (jsonData.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or has no valid data',
      })
    }

    // Validate all data first
    const validationErrors = []
    const processedData = []

    for (let i = 0; i < jsonData.length; i++) {
      const student = jsonData[i]
      const rowIndex = i + 2 // Excel row number (accounting for header)

      // Generate default contact info if missing
      const studentWithDefaults = generateDefaultContactInfo(student, rowIndex)

      // Validate student data
      const errors = validateStudentData(studentWithDefaults, rowIndex)
      validationErrors.push(...errors)

      // Check for duplicate regNo in the file
      const duplicateInFile = processedData.find(
        (s) => s.regNo === studentWithDefaults.regNo
      )
      if (duplicateInFile) {
        validationErrors.push(
          `Row ${rowIndex}: Duplicate regNo '${studentWithDefaults.regNo}' found in file`
        )
      }

      processedData.push(studentWithDefaults)
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        message: 'Validation errors found',
        errors: validationErrors,
      })
    }

    // Check for existing users and class arms
    const regNos = processedData.map((s) => s.regNo)
    const emails = processedData
      .map((s) => s.email)
      .filter((email) => !email.includes('@student.ledgrio.com'))
    const classArmNames = [...new Set(processedData.map((s) => s.classArm))]

    const existingUsers = await User.find({
      $or: [
        { regNo: { $in: regNos } },
        ...(emails.length > 0 ? [{ email: { $in: emails } }] : []),
      ],
    })

    const existingClassArms = await ClassArm.find({
      school: school_id,
      name: { $in: classArmNames },
    })

    // Check for conflicts (only for real emails, not generated ones)
    const conflicts = []
    existingUsers.forEach((user) => {
      if (regNos.includes(user.regNo)) {
        conflicts.push(`RegNo '${user.regNo}' already exists`)
      }
      if (
        emails.includes(user.email) &&
        !user.email.includes('@student.ledgrio.com')
      ) {
        conflicts.push(`Email '${user.email}' already exists`)
      }
    })

    if (conflicts.length > 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path)
      return res.status(400).json({
        success: false,
        message: 'Duplicate records found',
        conflicts: conflicts,
      })
    }

    // Create missing class arms
    const classArmMap = {}
    for (const classArm of existingClassArms) {
      classArmMap[classArm.name] = classArm._id
    }

    for (const className of classArmNames) {
      if (!classArmMap[className]) {
        const newClassArm = new ClassArm({
          school: school_id,
          name: className,
          totalNumberOfStudents: 0,
        })
        const savedClassArm = await newClassArm.save()
        classArmMap[className] = savedClassArm._id
      }
    }

    // Create default address for students without specific address
    const defaultAddress = new Address({
      country: 'Nigeria',
      state: 'Unknown',
      town: 'Unknown',
      street: 'Unknown',
      street_no: 1,
      zip_code: 0,
    })
    const savedDefaultAddress = await defaultAddress.save()

    // Process and create students
    const results = {
      successful: [],
      failed: [],
    }

    for (let i = 0; i < processedData.length; i++) {
      const studentData = processedData[i]
      const rowIndex = i + 2

      try {
        // Create profile
        const profile = new Profile({})
        const savedProfile = await profile.save()

        // Generate password using configured method
        const defaultPassword = generateDefaultPassword(studentData)
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)

        // Create student
        const student = new User({
          school: school_id,
          firstname: studentData.firstname.trim(),
          middlename: studentData.middlename
            ? studentData.middlename.trim()
            : '',
          lastname: studentData.lastname.trim(),
          regNo: studentData.regNo.trim(),
          email: studentData.email.trim().toLowerCase(),
          phone:
            typeof studentData.phone === 'string'
              ? studentData.phone.trim()
              : studentData.phone,
          address: savedDefaultAddress._id,
          profile: savedProfile._id,
          DOB: studentData.DOB
            ? new Date(studentData.DOB)
            : new Date('2000-01-01'),
          gender: studentData.gender,
          classArm: classArmMap[studentData.classArm],
          type: studentData.type,
          roles: ['Student'],
          password: hashedPassword,
          status: 'active',
          isActive: true,
        })

        await student.save()

        // Update class arm student count
        await autoUpdateClassArmStudentCount(
          classArmMap[studentData.classArm],
          { silent: true }
        )

        results.successful.push({
          row: rowIndex,
          regNo: studentData.regNo,
          name: `${studentData.firstname} ${studentData.lastname}`,
          email: studentData.email,
          password: defaultPassword,
        })
      } catch (error) {
        results.failed.push({
          row: rowIndex,
          regNo: studentData.regNo,
          name: `${studentData.firstname} ${studentData.lastname}`,
          error: error.message,
        })
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path)

    // Generate PDF with student credentials if there were successful uploads
    if (results.successful.length > 0) {
      try {
        const pdfResult = await generateStudentCredentialsPDF(
          results.successful,
          school,
          {
            title: `Student Login Credentials - ${school.name}`,
            subtitle: 'Bulk Upload Results',
          }
        )

        // Set PDF response headers
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${pdfResult.filename}"`
        )
        res.setHeader('Content-Length', pdfResult.buffer.length)

        // Send PDF as response
        res.send(pdfResult.buffer)

        // Clean up temporary PDF file
        setTimeout(() => {
          if (fs.existsSync(pdfResult.filepath)) {
            fs.unlinkSync(pdfResult.filepath)
          }
        }, 5000) // Clean up after 5 seconds
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError)

        // Fall back to JSON response if PDF generation fails
        res.status(200).json({
          success: true,
          message: `Bulk upload completed. ${results.successful.length} students created successfully, ${results.failed.length} failed. PDF generation failed.`,
          data: {
            totalProcessed: processedData.length,
            successful: results.successful.length,
            failed: results.failed.length,
            results: results,
          },
        })
      }
    } else {
      // No successful uploads, return JSON response
      res.status(200).json({
        success: true,
        message: `Bulk upload completed. ${results.successful.length} students created successfully, ${results.failed.length} failed.`,
        data: {
          totalProcessed: processedData.length,
          successful: results.successful.length,
          failed: results.failed.length,
          results: results,
        },
      })
    }
  } catch (error) {
    console.error('❌ Bulk upload error:', error)
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk upload',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}

// Download Excel template with ExcelJS (supports images)
// Note: Now supports actual image embedding using ExcelJS library
exports.downloadStudentTemplate = async (req, res) => {
  try {
    const { school_id } = req.query
    let school = null

    // If school_id is provided, fetch school details with group school
    if (school_id) {
      school = await School.findById(school_id).populate('groupSchool')
      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'School not found',
        })
      }

      // Check if user has access to this school (unless Admin)
      if (!req.user.roles.includes('Admin')) {
        const userSchool = req.user.school?._id || req.user.school
        if (userSchool.toString() !== school_id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied - you can only access your own school',
          })
        }
      }
    }

    // Create new workbook and worksheet using ExcelJS
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Students')

    let currentRow = 1

    // Add group school logo and information if available
    if (school && school.groupSchool) {
      try {
        // Try to download and embed the logo image
        if (
          school.groupSchool.logo &&
          school.groupSchool.logo.startsWith('http')
        ) {
          const imageBuffer = await downloadImage(school.groupSchool.logo)
          const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: 'png', // Assume PNG, could be enhanced to detect format
          })

          // Add image to worksheet (positioned at A1, with size)
          worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 }, // Top-left position
            ext: { width: 150, height: 75 }, // Image size
          })

          // Skip rows for the image
          currentRow = 4
        }
      } catch (error) {
        console.log('Could not embed logo image:', error.message)
        // Fall back to text if image fails
        worksheet.getCell(
          `A${currentRow}`
        ).value = `Logo: ${school.groupSchool.logo}`
        currentRow++
      }

      // Add group school name with styling
      const groupNameCell = worksheet.getCell(`A${currentRow}`)
      groupNameCell.value = school.groupSchool.name
      groupNameCell.font = { bold: true, size: 18, color: { argb: 'FF0066CC' } }
      groupNameCell.alignment = { horizontal: 'center' }
      worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
      currentRow++

      // Add group school description
      if (school.groupSchool.description) {
        const descCell = worksheet.getCell(`A${currentRow}`)
        descCell.value = school.groupSchool.description
        descCell.font = { italic: true, size: 12 }
        descCell.alignment = { horizontal: 'center' }
        worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
        currentRow++
      }

      // Add separator
      currentRow++
    }

    // Add school information
    if (school) {
      // School name - make it more prominent
      const schoolNameCell = worksheet.getCell(`A${currentRow}`)
      schoolNameCell.value = school.name.toUpperCase()
      schoolNameCell.font = {
        bold: true,
        size: 20,
        color: { argb: 'FF0066CC' },
      }
      schoolNameCell.alignment = { horizontal: 'center' }
      schoolNameCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F8FF' },
      }
      schoolNameCell.border = {
        top: { style: 'thick', color: { argb: 'FF0066CC' } },
        left: { style: 'thick', color: { argb: 'FF0066CC' } },
        bottom: { style: 'thick', color: { argb: 'FF0066CC' } },
        right: { style: 'thick', color: { argb: 'FF0066CC' } },
      }
      worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
      currentRow++

      // School contact info
      if (school.email) {
        const emailCell = worksheet.getCell(`A${currentRow}`)
        emailCell.value = `Email: ${school.email}`
        emailCell.font = { italic: true, size: 11 }
        emailCell.alignment = { horizontal: 'center' }
        worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
        currentRow++
      }
      if (school.phoneNumber) {
        const phoneCell = worksheet.getCell(`A${currentRow}`)
        phoneCell.value = `Phone: ${school.phoneNumber}`
        phoneCell.font = { italic: true, size: 11 }
        phoneCell.alignment = { horizontal: 'center' }
        worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
        currentRow++
      }

      // Add spacing
      currentRow += 2

      // Add template title
      const titleCell = worksheet.getCell(`A${currentRow}`)
      titleCell.value = 'STUDENT BULK UPLOAD TEMPLATE'
      titleCell.font = { bold: true, size: 14, color: { argb: 'FF333333' } }
      titleCell.alignment = { horizontal: 'center' }
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE4B5' },
      }
      worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
      currentRow += 2
    }

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

    // Add instruction row
    const instructionRow = currentRow
    const instructionCell = worksheet.getCell(instructionRow, 1)
    instructionCell.value =
      'NOTE: email and phone are optional - will be auto-generated if empty'
    instructionCell.font = { italic: true, color: { argb: 'FF666666' } }
    worksheet.mergeCells(`A${instructionRow}:J${instructionRow}`)
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
        '', // Empty email - will be auto-generated
        '', // Empty phone - will be auto-generated
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

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Set response headers with school-specific filename
    const filename = school
      ? `${school.name.replace(/[^a-zA-Z0-9]/g, '_')}_students.xlsx`
      : 'students.xlsx'

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    res.send(buffer)
  } catch (error) {
    console.error('Error generating template:', error)
    res.status(500).json({
      success: false,
      message: 'Error generating template',
      error: error.message,
    })
  }
}

module.exports = {
  bulkUploadStudents: exports.bulkUploadStudents,
  downloadStudentTemplate: exports.downloadStudentTemplate,
}
