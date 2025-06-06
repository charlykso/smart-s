const express = require('express')
const schoolController = require('../controller/School_view')
const authenticateToken = require('../middleware/authenticateToken')
const { checkSchoolAccess } = require('../middleware/auth')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()

router.get('/all', schoolController.getSchools)
router
  .route('/:id')
  .get(
    authenticateToken,
    verifyRoles(
      roleList.Principal,
      roleList.Student,
      roleList.ICT_administrator,
      roleList.Headteacher,
      roleList.Proprietor,
      roleList.Admin
    ),
    checkSchoolAccess,
    schoolController.getSchool
  ) //principal
router
  .route('/create')
  .post(
    authenticateToken,
    verifyRoles(roleList.Admin),
    schoolController.createSchool
  ) //Admin

router
  .route('/:id/update')
  .put(
    authenticateToken,
    verifyRoles(roleList.Admin),
    schoolController.updateSchool
  ) //Admin
router
  .route('/:id/delete')
  .delete(
    authenticateToken,
    verifyRoles(roleList.Admin),
    schoolController.deleteSchool
  ) //Admin
router
  .route('/by-address/:address_id')
  .get(
    authenticateToken,
    verifyRoles(roleList.Principal, roleList.Admin),
    schoolController.getSchoolByAddress
  ) //principal

router
  .route('/by-groupSchool/:groupSchool_id')
  .get(
    authenticateToken,
    verifyRoles(roleList.Principal, roleList.Admin),
    schoolController.getSchoolByGroupSchool
  ) //principal

module.exports = router
