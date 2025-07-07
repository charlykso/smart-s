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
    'email',
    'phone',
    'regNo',
    'gender',
    'DOB',
    'classArm',
    'type',
  ]

  // Check required fields
  requiredFields.forEach((field) => {
    if (!student[field] || student[field].toString().trim() === '') {
      errors.push(`Row ${rowIndex}: ${field} is required`)
    }
  })

  // Validate email format
  if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
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

  // Validate phone number (basic check)
  if (student.phone && !/^\+?[\d\s\-\(\)]+$/.test(student.phone)) {
    errors.push(`Row ${rowIndex}: Invalid phone number format`)
  }

  return errors
}

// Configuration for bulk upload
const BULK_UPLOAD_CONFIG = {
  // Password generation method: 'regNo', 'phone', or 'legacy'
  // 'regNo' - Uses student registration number as password (recommended)
  // 'phone' - Uses phone number (digits only) as password
  // 'legacy' - Uses firstname + last 3 digits of regNo + year (original method)
  passwordType: 'phone', // Changed to use phone number
}

// Generate default password - updated to use more practical options
const generateDefaultPassword = (
  studentData,
  passwordType = BULK_UPLOAD_CONFIG.passwordType
) => {
  switch (passwordType) {
    case 'phone':
      // Use phone number as password (remove any non-digits)
      return studentData.phone.replace(/\D/g, '')
    case 'regNo':
      // Use registration number as password
      return studentData.regNo
    case 'legacy':
      // Original method: firstname + last 3 digits of regNo + year
      return `${studentData.firstname.toLowerCase()}${studentData.regNo.slice(
        -3
      )}2024`
    default:
      // Default to regNo for simplicity
      return studentData.regNo
  }
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

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

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

      // Validate student data
      const errors = validateStudentData(student, rowIndex)
      validationErrors.push(...errors)

      // Check for duplicate regNo in the file
      const duplicateInFile = processedData.find(
        (s) => s.regNo === student.regNo
      )
      if (duplicateInFile) {
        validationErrors.push(
          `Row ${rowIndex}: Duplicate regNo '${student.regNo}' found in file`
        )
      }

      processedData.push(student)
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
    const emails = processedData.map((s) => s.email)
    const classArmNames = [...new Set(processedData.map((s) => s.classArm))]

    const existingUsers = await User.find({
      $or: [{ regNo: { $in: regNos } }, { email: { $in: emails } }],
    })

    const existingClassArms = await ClassArm.find({
      school: school_id,
      name: { $in: classArmNames },
    })

    // Check for conflicts
    const conflicts = []
    existingUsers.forEach((user) => {
      if (regNos.includes(user.regNo)) {
        conflicts.push(`RegNo '${user.regNo}' already exists`)
      }
      if (emails.includes(user.email)) {
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
          phone: studentData.phone.trim(),
          address: savedDefaultAddress._id,
          profile: savedProfile._id,
          DOB: new Date(studentData.DOB),
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
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk upload',
      error: error.message,
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
      // School name
      const schoolNameCell = worksheet.getCell(`A${currentRow}`)
      schoolNameCell.value = school.name
      schoolNameCell.font = { bold: true, size: 16 }
      schoolNameCell.alignment = { horizontal: 'center' }
      worksheet.mergeCells(`A${currentRow}:J${currentRow}`)
      currentRow++

      // School contact info
      if (school.email) {
        worksheet.getCell(`A${currentRow}`).value = `Email: ${school.email}`
        currentRow++
      }
      if (school.phoneNumber) {
        worksheet.getCell(
          `A${currentRow}`
        ).value = `Phone: ${school.phoneNumber}`
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
