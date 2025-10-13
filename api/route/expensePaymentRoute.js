const express = require('express')
const multer = require('multer')
const path = require('path')
const expensePaymentController = require('../controller/expensePayment_view')
const authenticateToken = require('../middleware/authenticateToken')
const {
  filterByUserSchool,
  enforceSchoolBoundary,
} = require('../middleware/auth')
const verifyRoles = require('../middleware/verifyRoles')
const roleList = require('../helpers/roleList')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads/receipts')
    const fs = require('fs')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(
      null,
      `expense-receipt-${uniqueSuffix}${path.extname(file.originalname)}`
    )
  },
})

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only images and PDF receipts are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
})

router.get(
  '/',
  authenticateToken,
  verifyRoles(
    roleList.Admin,
    roleList.Bursar,
    roleList.Principal,
    roleList.Proprietor
  ),
  filterByUserSchool,
  expensePaymentController.getPayments
)

router.get(
  '/expense/:expenseId',
  authenticateToken,
  verifyRoles(
    roleList.Admin,
    roleList.Bursar,
    roleList.Principal,
    roleList.Proprietor
  ),
  filterByUserSchool,
  expensePaymentController.getPayments
)

router.get(
  '/:id',
  authenticateToken,
  verifyRoles(
    roleList.Admin,
    roleList.Bursar,
    roleList.Principal,
    roleList.Proprietor
  ),
  filterByUserSchool,
  expensePaymentController.getPayment
)

router.post(
  '/expense/:expenseId',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.Bursar),
  enforceSchoolBoundary,
  upload.single('receipt'),
  expensePaymentController.createPayment
)

router.put(
  '/:id',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.Bursar),
  enforceSchoolBoundary,
  upload.single('receipt'),
  expensePaymentController.updatePayment
)

router.delete(
  '/:id',
  authenticateToken,
  verifyRoles(roleList.Admin, roleList.Bursar),
  enforceSchoolBoundary,
  expensePaymentController.deletePayment
)

module.exports = router
