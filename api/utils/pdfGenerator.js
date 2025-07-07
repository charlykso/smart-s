const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

// Generate PDF with student credentials
const generateStudentCredentialsPDF = async (
  students,
  schoolInfo,
  options = {}
) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      })

      // Create a unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `student_credentials_${timestamp}.pdf`
      const filepath = path.join(__dirname, '../uploads/temp', filename)

      // Ensure the temp directory exists
      const tempDir = path.dirname(filepath)
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      // Create write stream
      const stream = fs.createWriteStream(filepath)
      doc.pipe(stream)

      // Header with school information
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('STUDENT LOGIN CREDENTIALS', { align: 'center' })

      doc.moveDown(0.5)

      // School information
      if (schoolInfo && schoolInfo.name) {
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text(schoolInfo.name, { align: 'center' })

        if (schoolInfo.groupSchool && schoolInfo.groupSchool.name) {
          doc
            .fontSize(12)
            .font('Helvetica')
            .text(`Part of ${schoolInfo.groupSchool.name}`, { align: 'center' })
        }
      }

      doc.moveDown(0.5)

      // Date and time
      const now = new Date()
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(
          `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
          { align: 'center' }
        )

      doc.moveDown(1)

      // Instructions
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('LOGIN INSTRUCTIONS:', { align: 'left' })

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(
          '• Students should use their email address and the password provided below',
          { align: 'left' }
        )
        .text('• Passwords are based on phone numbers (digits only)', {
          align: 'left',
        })
        .text('• Students can change their password after first login', {
          align: 'left',
        })
        .text('• Website: [Your School Portal URL]', { align: 'left' })

      doc.moveDown(1)

      // Table header
      doc.fontSize(11).font('Helvetica-Bold')

      const tableTop = doc.y
      const nameX = 50
      const regNoX = 200
      const emailX = 280
      const passwordX = 450

      // Draw table header
      doc
        .text('Student Name', nameX, tableTop)
        .text('Reg No', regNoX, tableTop)
        .text('Email', emailX, tableTop)
        .text('Password', passwordX, tableTop)

      // Draw header line
      doc
        .moveTo(nameX, tableTop + 15)
        .lineTo(520, tableTop + 15)
        .stroke()

      let currentY = tableTop + 25

      // Add student data
      doc.font('Helvetica').fontSize(9)

      students.forEach((student, index) => {
        // Check if we need a new page
        if (currentY > 700) {
          doc.addPage()
          currentY = 50

          // Redraw header on new page
          doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text('Student Name', nameX, currentY)
            .text('Reg No', regNoX, currentY)
            .text('Email', emailX, currentY)
            .text('Password', passwordX, currentY)

          doc
            .moveTo(nameX, currentY + 15)
            .lineTo(520, currentY + 15)
            .stroke()

          currentY += 25
          doc.font('Helvetica').fontSize(9)
        }

        // Add student row
        const studentName =
          student.name ||
          `${student.firstname || ''} ${student.lastname || ''}`.trim()

        doc
          .text(studentName.substring(0, 20), nameX, currentY)
          .text(student.regNo || '', regNoX, currentY)
          .text(
            student.email ? student.email.substring(0, 25) : '',
            emailX,
            currentY
          )
          .text(student.password || '', passwordX, currentY)

        currentY += 20

        // Add separator line every 5 rows for readability
        if ((index + 1) % 5 === 0) {
          doc
            .moveTo(nameX, currentY)
            .lineTo(520, currentY)
            .strokeOpacity(0.3)
            .stroke()
            .strokeOpacity(1)
          currentY += 5
        }
      })

      // Footer
      const pageCount = doc.bufferedPageRange().count
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i)
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(`Page ${i + 1} of ${pageCount}`, 50, 750, {
            align: 'center',
            width: 500,
          })

        doc.text('CONFIDENTIAL - Handle with care', 50, 770, {
          align: 'center',
          width: 500,
        })
      }

      // Finalize the PDF
      doc.end()

      // Wait for the stream to finish
      stream.on('finish', () => {
        resolve({
          filepath,
          filename,
          buffer: fs.readFileSync(filepath),
        })
      })

      stream.on('error', (error) => {
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}

// Clean up temporary PDF files (call this periodically)
const cleanupTempPDFs = () => {
  const tempDir = path.join(__dirname, '../uploads/temp')
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir)
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    files.forEach((file) => {
      const filePath = path.join(tempDir, file)
      const stats = fs.statSync(filePath)
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath)
        console.log(`Cleaned up old PDF: ${file}`)
      }
    })
  }
}

module.exports = {
  generateStudentCredentialsPDF,
  cleanupTempPDFs,
}
