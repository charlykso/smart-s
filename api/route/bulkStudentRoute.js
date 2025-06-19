const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()
const authenticateToken = require('../middleware/authenticateToken')
const {
  validateSchoolAssignment,
  checkSchoolAccess,
} = require('../middleware/auth')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const bulkUploadController = require('../controller/bulkStudentUpload')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads')
    // Create uploads directory if it doesn't exist
    const fs = require('fs')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, 'bulk-students-' + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  // Accept only Excel files
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed'),
      false
    )
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// Download bulk upload template
router.get(
  '/template',
  authenticateToken,
  verifyRoles(
    roleList.Admin,
    roleList.ICT_administrator,
    roleList.Proprietor,
    roleList.Principal
  ),
  bulkUploadController.downloadStudentTemplate
)

// Upload bulk students
router.post(
  '/upload',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor),
  upload.single('file'),
  validateSchoolAssignment,
  bulkUploadController.bulkUploadStudents
)

// Get upload history
router.get(
  '/history',
  authenticateToken,
  verifyRoles(
    roleList.Admin,
    roleList.ICT_administrator,
    roleList.Proprietor,
    roleList.Principal
  ),
  (req, res) => {
    res.json({
      success: true,
      data: [],
      message: 'Upload history feature coming soon',
    })
  }
)

// Get upload status
router.get(
  '/status/:uploadId',
  authenticateToken,
  verifyRoles(
    roleList.Admin,
    roleList.ICT_administrator,
    roleList.Proprietor,
    roleList.Principal
  ),
  (req, res) => {
    res.json({
      success: true,
      data: { status: 'completed' },
      message: 'Upload status feature coming soon',
    })
  }
)

// Delete failed upload records
router.delete(
  '/cleanup/:uploadId',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor),
  (req, res) => {
    res.json({
      success: true,
      message: 'Cleanup feature coming soon',
    })
  }
)

module.exports = router
