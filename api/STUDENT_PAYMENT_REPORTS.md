# Student Payment Reports - PDF Generation System

## Overview

This system provides comprehensive PDF reports for student fee payments with flexible filtering options including term, session, and custom date ranges.

## Backend Implementation

### Required Dependencies

```bash
npm install pdfkit
npm install moment
```

### 1. Enhanced API Endpoints

#### Get Student Payment Report (PDF)

```javascript
// routes/reports.js
const PDFDocument = require('pdfkit')
const moment = require('moment')

// Get student payment report as PDF
router.get(
  '/student/:student_id/payments/pdf',
  authenticateToken,
  async (req, res) => {
    try {
      const { student_id } = req.params
      const {
        term_id,
        session_id,
        date_from,
        date_to,
        include_pending = false,
        report_type = 'detailed', // 'detailed' or 'summary'
      } = req.query

      // Validate student access (students can only access their own reports)
      if (req.user.roles.includes('Student') && req.user.Id !== student_id) {
        return res.status(403).json({ message: 'Access denied' })
      }

      // Build filter criteria
      const filter = await buildPaymentFilter(student_id, {
        term_id,
        session_id,
        date_from,
        date_to,
        include_pending,
      })

      // Get student information
      const student = await User.findById(student_id)
        .populate('school', 'name email phoneNumber')
        .populate('classArm', 'name')
        .populate('profile')

      if (!student) {
        return res.status(404).json({ message: 'Student not found' })
      }

      // Get payments data
      const payments = await Payment.find(filter)
        .populate({
          path: 'fee',
          populate: {
            path: 'term session school',
            select: 'name startDate endDate',
          },
        })
        .sort({ trans_date: -1 })

      // Generate PDF
      const pdfBuffer = await generateStudentPaymentPDF(student, payments, {
        term_id,
        session_id,
        date_from,
        date_to,
        report_type,
      })

      // Set response headers for PDF
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="student-payment-report-${
          student.regNo
        }-${moment().format('YYYY-MM-DD')}.pdf"`
      )
      res.setHeader('Content-Length', pdfBuffer.length)

      res.send(pdfBuffer)
    } catch (error) {
      console.error('Error generating student payment report:', error)
      res
        .status(500)
        .json({
          message: 'Error generating payment report',
          error: error.message,
        })
    }
  }
)

// Get multiple students payment report (for admin/teachers)
router.post(
  '/students/payments/pdf',
  authenticateToken,
  verifyRoles(['Admin', 'Principal', 'Bursar', 'Headteacher']),
  async (req, res) => {
    try {
      const {
        student_ids,
        term_id,
        session_id,
        date_from,
        date_to,
        include_pending = false,
        report_type = 'summary',
      } = req.body

      if (
        !student_ids ||
        !Array.isArray(student_ids) ||
        student_ids.length === 0
      ) {
        return res.status(400).json({ message: 'Student IDs are required' })
      }

      // Get students information
      const students = await User.find({ _id: { $in: student_ids } })
        .populate('school', 'name email phoneNumber')
        .populate('classArm', 'name')
        .populate('profile')

      // Get payments for all students
      const paymentsData = await Promise.all(
        students.map(async (student) => {
          const filter = await buildPaymentFilter(student._id, {
            term_id,
            session_id,
            date_from,
            date_to,
            include_pending,
          })

          const payments = await Payment.find(filter)
            .populate({
              path: 'fee',
              populate: {
                path: 'term session school',
                select: 'name startDate endDate',
              },
            })
            .sort({ trans_date: -1 })

          return { student, payments }
        })
      )

      // Generate combined PDF
      const pdfBuffer = await generateMultipleStudentsPaymentPDF(paymentsData, {
        term_id,
        session_id,
        date_from,
        date_to,
        report_type,
      })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="students-payment-report-${moment().format(
          'YYYY-MM-DD'
        )}.pdf"`
      )
      res.setHeader('Content-Length', pdfBuffer.length)

      res.send(pdfBuffer)
    } catch (error) {
      console.error('Error generating students payment report:', error)
      res
        .status(500)
        .json({
          message: 'Error generating payment report',
          error: error.message,
        })
    }
  }
)
```

### 2. Payment Filter Builder

```javascript
// utils/paymentFilters.js
const buildPaymentFilter = async (student_id, options) => {
  const { term_id, session_id, date_from, date_to, include_pending } = options

  let filter = { user: student_id }

  // Status filter
  if (!include_pending) {
    filter.status = 'success'
  }

  // Term-based filtering
  if (term_id) {
    const fees = await Fee.find({ term: term_id }).select('_id')
    filter.fee = { $in: fees.map((f) => f._id) }
  }

  // Session-based filtering
  else if (session_id) {
    const terms = await Term.find({ session: session_id }).select('_id')
    const fees = await Fee.find({ term: { $in: terms } }).select('_id')
    filter.fee = { $in: fees.map((f) => f._id) }
  }

  // Date range filtering
  if (date_from || date_to) {
    filter.trans_date = {}
    if (date_from) filter.trans_date.$gte = new Date(date_from)
    if (date_to) filter.trans_date.$lte = new Date(date_to)
  }

  return filter
}

module.exports = { buildPaymentFilter }
```

### 3. PDF Generation Functions

```javascript
// utils/pdfGenerator.js
const PDFDocument = require('pdfkit')
const moment = require('moment')

const generateStudentPaymentPDF = async (student, payments, options) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const buffers = []

      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })

      // Header
      addPDFHeader(doc, student.school)

      // Title
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('STUDENT PAYMENT REPORT', 50, 150, { align: 'center' })

      // Student Information
      addStudentInfo(doc, student, 180)

      // Report Period
      addReportPeriod(doc, options, 250)

      // Payment Summary
      const summary = calculatePaymentSummary(payments)
      addPaymentSummary(doc, summary, 300)

      // Payment Details
      if (options.report_type === 'detailed') {
        addDetailedPayments(doc, payments, 380)
      } else {
        addSummaryPayments(doc, payments, 380)
      }

      // Footer
      addPDFFooter(doc)

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

const addPDFHeader = (doc, school) => {
  // School logo (if available)
  // doc.image('path/to/logo.png', 50, 50, { width: 60 });

  // School information
  doc.fontSize(16).font('Helvetica-Bold').text(school.name, 120, 60)

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Email: ${school.email}`, 120, 80)
    .text(`Phone: ${school.phoneNumber}`, 120, 95)

  // Line separator
  doc.moveTo(50, 130).lineTo(550, 130).stroke()
}

const addStudentInfo = (doc, student, yPosition) => {
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('STUDENT INFORMATION', 50, yPosition)

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(
      `Name: ${student.firstname} ${student.middlename || ''} ${
        student.lastname
      }`,
      50,
      yPosition + 20
    )
    .text(`Registration Number: ${student.regNo}`, 50, yPosition + 35)
    .text(`Class: ${student.classArm?.name || 'N/A'}`, 300, yPosition + 20)
    .text(`Student Type: ${student.type}`, 300, yPosition + 35)
}

const addReportPeriod = (doc, options, yPosition) => {
  doc.fontSize(12).font('Helvetica-Bold').text('REPORT PERIOD', 50, yPosition)

  let periodText = ''
  if (options.term_id) {
    periodText = 'Term-based Report'
  } else if (options.session_id) {
    periodText = 'Session-based Report'
  } else if (options.date_from || options.date_to) {
    const from = options.date_from
      ? moment(options.date_from).format('DD/MM/YYYY')
      : 'Beginning'
    const to = options.date_to
      ? moment(options.date_to).format('DD/MM/YYYY')
      : 'Present'
    periodText = `Custom Period: ${from} - ${to}`
  } else {
    periodText = 'All Time'
  }

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(periodText, 50, yPosition + 20)
    .text(
      `Generated on: ${moment().format('DD/MM/YYYY HH:mm')}`,
      50,
      yPosition + 35
    )
}

const addPaymentSummary = (doc, summary, yPosition) => {
  doc.fontSize(12).font('Helvetica-Bold').text('PAYMENT SUMMARY', 50, yPosition)

  // Summary table
  const tableTop = yPosition + 25

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Total Payments:', 50, tableTop)
    .text('Total Amount:', 50, tableTop + 15)
    .text('Successful Payments:', 50, tableTop + 30)
    .text('Pending Payments:', 50, tableTop + 45)

  doc
    .font('Helvetica')
    .text(summary.totalPayments.toString(), 200, tableTop)
    .text(`₦${summary.totalAmount.toLocaleString()}`, 200, tableTop + 15)
    .text(summary.successfulPayments.toString(), 200, tableTop + 30)
    .text(summary.pendingPayments.toString(), 200, tableTop + 45)
}

const addDetailedPayments = (doc, payments, yPosition) => {
  doc.fontSize(12).font('Helvetica-Bold').text('PAYMENT DETAILS', 50, yPosition)

  // Table headers
  const tableTop = yPosition + 25
  const tableHeaders = [
    'Date',
    'Fee Name',
    'Amount',
    'Method',
    'Status',
    'Reference',
  ]
  const columnWidths = [80, 150, 80, 80, 60, 90]
  let xPosition = 50

  doc.fontSize(9).font('Helvetica-Bold')
  tableHeaders.forEach((header, index) => {
    doc.text(header, xPosition, tableTop)
    xPosition += columnWidths[index]
  })

  // Table rows
  let currentY = tableTop + 20
  doc.fontSize(8).font('Helvetica')

  payments.forEach((payment, index) => {
    if (currentY > 700) {
      // Start new page if needed
      doc.addPage()
      currentY = 50
    }

    xPosition = 50
    const rowData = [
      moment(payment.trans_date).format('DD/MM/YY'),
      payment.fee.name.substring(0, 20) +
        (payment.fee.name.length > 20 ? '...' : ''),
      `₦${payment.amount.toLocaleString()}`,
      payment.mode_of_payment,
      payment.status,
      payment.trx_ref || 'N/A',
    ]

    rowData.forEach((data, colIndex) => {
      doc.text(data, xPosition, currentY)
      xPosition += columnWidths[colIndex]
    })

    currentY += 15
  })
}

const calculatePaymentSummary = (payments) => {
  return {
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
    successfulPayments: payments.filter((p) => p.status === 'success').length,
    pendingPayments: payments.filter((p) => p.status === 'pending').length,
    failedPayments: payments.filter((p) => p.status === 'failed').length,
  }
}

const addPDFFooter = (doc) => {
  const bottomMargin = 50
  doc
    .fontSize(8)
    .font('Helvetica')
    .text(
      'This is a computer-generated report. No signature required.',
      50,
      doc.page.height - bottomMargin,
      {
        align: 'center',
      }
    )
    .text(
      `Generated by Smart-S School Management System on ${moment().format(
        'DD/MM/YYYY HH:mm'
      )}`,
      50,
      doc.page.height - bottomMargin + 15,
      {
        align: 'center',
      }
    )
}

module.exports = {
  generateStudentPaymentPDF,
  generateMultipleStudentsPaymentPDF,
}
```

### 4. Route Integration

```javascript
// Add to server.js or main routes file
const reportRoutes = require('./routes/reports')
app.use('/api/v1/reports', reportRoutes)
```

## 5. Enhanced PDF Styling and Formatting

```javascript
// utils/pdfStyles.js
const PDFStyles = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    light: '#f8fafc',
    dark: '#1e293b',
  },

  fonts: {
    title: { size: 18, font: 'Helvetica-Bold' },
    heading: { size: 14, font: 'Helvetica-Bold' },
    subheading: { size: 12, font: 'Helvetica-Bold' },
    body: { size: 10, font: 'Helvetica' },
    small: { size: 8, font: 'Helvetica' },
    caption: { size: 7, font: 'Helvetica' },
  },

  spacing: {
    small: 5,
    medium: 10,
    large: 20,
    xlarge: 30,
  },
}

const addStyledHeader = (doc, school, reportTitle) => {
  // Background header
  doc.rect(0, 0, doc.page.width, 120).fill(PDFStyles.colors.primary)

  // School name in white
  doc
    .fillColor('white')
    .fontSize(PDFStyles.fonts.title.size)
    .font(PDFStyles.fonts.title.font)
    .text(school.name, 50, 30)

  // Report title
  doc.fontSize(PDFStyles.fonts.heading.size).text(reportTitle, 50, 55)

  // School contact info
  doc
    .fontSize(PDFStyles.fonts.small.size)
    .font(PDFStyles.fonts.small.font)
    .text(`${school.email} | ${school.phoneNumber}`, 50, 80)

  // Reset color for body content
  doc.fillColor(PDFStyles.colors.dark)
}

module.exports = { PDFStyles, addStyledHeader }
```

## 6. Advanced Filtering and Aggregation

```javascript
// utils/paymentAggregation.js
const aggregatePaymentsByFeeType = (payments) => {
  const aggregation = {}

  payments.forEach((payment) => {
    const feeType = payment.fee.type || 'Other'
    if (!aggregation[feeType]) {
      aggregation[feeType] = {
        count: 0,
        totalAmount: 0,
        payments: [],
      }
    }

    aggregation[feeType].count++
    aggregation[feeType].totalAmount += payment.amount
    aggregation[feeType].payments.push(payment)
  })

  return aggregation
}

const aggregatePaymentsByTerm = (payments) => {
  const aggregation = {}

  payments.forEach((payment) => {
    const termName = payment.fee.term?.name || 'Unknown Term'
    if (!aggregation[termName]) {
      aggregation[termName] = {
        count: 0,
        totalAmount: 0,
        payments: [],
      }
    }

    aggregation[termName].count++
    aggregation[termName].totalAmount += payment.amount
    aggregation[termName].payments.push(payment)
  })

  return aggregation
}

const calculateOutstandingFees = async (studentId, sessionId) => {
  // Get all fees for the session
  const terms = await Term.find({ session: sessionId })
  const fees = await Fee.find({
    term: { $in: terms.map((t) => t._id) },
    isActive: true,
    isApproved: true,
  })

  // Get all successful payments for these fees
  const payments = await Payment.find({
    user: studentId,
    fee: { $in: fees.map((f) => f._id) },
    status: 'success',
  })

  // Calculate outstanding amounts
  const outstanding = []
  fees.forEach((fee) => {
    const paidAmount = payments
      .filter((p) => p.fee.toString() === fee._id.toString())
      .reduce((sum, p) => sum + p.amount, 0)

    if (paidAmount < fee.amount) {
      outstanding.push({
        fee,
        totalAmount: fee.amount,
        paidAmount,
        outstandingAmount: fee.amount - paidAmount,
      })
    }
  })

  return outstanding
}

module.exports = {
  aggregatePaymentsByFeeType,
  aggregatePaymentsByTerm,
  calculateOutstandingFees,
}
```

## 7. Email Integration for Report Delivery

```javascript
// utils/emailReports.js
const nodemailer = require('nodemailer')

const sendReportByEmail = async (recipientEmail, pdfBuffer, reportDetails) => {
  try {
    const transporter = nodemailer.createTransporter({
      // Configure your email service
      service: 'gmail', // or your preferred service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: `Payment Report - ${reportDetails.studentName}`,
      html: `
        <h2>Student Payment Report</h2>
        <p>Dear Parent/Guardian,</p>
        <p>Please find attached the payment report for <strong>${
          reportDetails.studentName
        }</strong>.</p>
        <p><strong>Report Period:</strong> ${reportDetails.period}</p>
        <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
        <p>Best regards,<br>${reportDetails.schoolName}</p>
      `,
      attachments: [
        {
          filename: `payment-report-${reportDetails.studentRegNo}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

// Add email endpoint
router.post(
  '/student/:student_id/payments/email',
  authenticateToken,
  async (req, res) => {
    try {
      const { student_id } = req.params
      const { email, ...filterOptions } = req.body

      // Generate PDF
      const filter = await buildPaymentFilter(student_id, filterOptions)
      const student = await User.findById(student_id).populate('school')
      const payments = await Payment.find(filter).populate('fee')

      const pdfBuffer = await generateStudentPaymentPDF(
        student,
        payments,
        filterOptions
      )

      // Send email
      const emailResult = await sendReportByEmail(email, pdfBuffer, {
        studentName: `${student.firstname} ${student.lastname}`,
        studentRegNo: student.regNo,
        schoolName: student.school.name,
        period: determinePeriodDescription(filterOptions),
      })

      if (emailResult.success) {
        res.json({ message: 'Report sent successfully via email' })
      } else {
        res
          .status(500)
          .json({ message: 'Failed to send email', error: emailResult.error })
      }
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Error sending report via email',
          error: error.message,
        })
    }
  }
)

module.exports = { sendReportByEmail }
```

## 8. Batch Report Generation

```javascript
// Add batch processing endpoint
router.post(
  '/class/:class_id/payments/pdf',
  authenticateToken,
  verifyRoles(['Admin', 'Principal', 'Bursar']),
  async (req, res) => {
    try {
      const { class_id } = req.params
      const filterOptions = req.body

      // Get all students in the class
      const students = await User.find({
        classArm: class_id,
        roles: 'Student',
      }).populate('school classArm')

      if (students.length === 0) {
        return res
          .status(404)
          .json({ message: 'No students found in this class' })
      }

      // Generate combined report for all students
      const classReportData = await Promise.all(
        students.map(async (student) => {
          const filter = await buildPaymentFilter(student._id, filterOptions)
          const payments = await Payment.find(filter).populate('fee')
          return { student, payments }
        })
      )

      const pdfBuffer = await generateClassPaymentReportPDF(
        classReportData,
        filterOptions
      )

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="class-payment-report-${
          students[0].classArm.name
        }-${moment().format('YYYY-MM-DD')}.pdf"`
      )
      res.send(pdfBuffer)
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Error generating class payment report',
          error: error.message,
        })
    }
  }
)
```

This implementation provides comprehensive PDF generation for student payment reports with flexible filtering options, professional formatting, proper security controls, advanced styling, email delivery, and batch processing capabilities.
