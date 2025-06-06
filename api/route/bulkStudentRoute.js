const express = require('express')
const bulkStudentController = require('../controller/bulkStudentUpload')
const authenticateToken = require('../middleware/authenticateToken')
const { checkSchoolAccess } = require('../middleware/auth')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = 'uploads/bulk-students'
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for Excel file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `bulk-students-${uniqueSuffix}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv (for future support)
    ]

    const allowedExtensions = ['.xlsx', '.xls']
    const fileExtension = path.extname(file.originalname).toLowerCase()

    if (
      allowedMimes.includes(file.mimetype) ||
      allowedExtensions.includes(fileExtension)
    ) {
      cb(null, true)
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false)
    }
  },
})

// Routes

/**
 * @route POST /api/v1/bulk-students/upload
 * @desc Upload Excel file to create multiple students
 * @access Admin, ICT_administrator (school-scoped)
 */
router.post(
  '/upload',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.Proprietor, roleList.ICT_administrator),
  upload.single('studentFile'),
  bulkStudentController.bulkUploadStudents
)

/**
 * @route GET /api/v1/bulk-students/template
 * @desc Download Excel template for bulk student upload
 * @access Admin, ICT_administrator
 */
router.get(
  '/template',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.Proprietor, roleList.ICT_administrator),
  bulkStudentController.downloadStudentTemplate
)

/**
 * @route POST /api/v1/bulk-students/upload/:school_id
 * @desc Upload Excel file to create multiple students for specific school
 * @access Admin, ICT_administrator (with school access check)
 */
router.post(
  '/upload/:school_id',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.Proprietor, roleList.ICT_administrator),
  checkSchoolAccess,
  upload.single('studentFile'),
  (req, res, next) => {
    // Set school_id from params to body for controller
    req.body.school_id = req.params.school_id
    next()
  },
  bulkStudentController.bulkUploadStudents
)

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      })
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`,
    })
  }

  if (error.message === 'Only Excel files (.xlsx, .xls) are allowed') {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }

  next(error)
})

module.exports = router
