const express = require('express')
const groupSchoolController = require('../controller/groupSchool_view')
const authenticateToken = require('../middleware/authenticateToken')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()
const multer = require('multer')

router.route('/all')
  .get(authenticateToken, verifyRoles(roleList.Admin), groupSchoolController.getGroupSchools) //admin
router.route('/:id')
 .get(authenticateToken, verifyRoles(roleList.Admin), groupSchoolController.getGroupSchool) //admin
router.route('/create')
 .post(authenticateToken, verifyRoles(roleList.Admin), groupSchoolController.createGroupSchool) //Admin

router.route('/:id/update')
 .put(authenticateToken, verifyRoles(roleList.Admin), groupSchoolController.updateGroupSchool) //Admin

router.route('/:id/delete')
 .delete(authenticateToken, verifyRoles(roleList.Admin), groupSchoolController.deleteGroupSchool) //Admin

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({ storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    }else{
      cb(new Error('Only image files are allowed'), false)
    }
  }
 })
router.route('/:id/upload')
 .put(upload.single('file'), groupSchoolController.uploadSchoolLogo)

module.exports = router