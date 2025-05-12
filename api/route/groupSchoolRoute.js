const express = require('express')
const GroupSchoolController = require('../controller/groupSchool_view')
const authenticateToken = require('../middleware/authenticateToken')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()

router.route('/all')
  .get(authenticateToken, verifyRoles(roleList.admin), GroupSchoolController.getGroupSchools) //admin
router.route('/:id')
 .get(authenticateToken, verifyRoles(roleList.admin), GroupSchoolController.getGroupSchool) //admin
router.route('/create')
 .post(authenticateToken, verifyRoles(roleList.admin), GroupSchoolController.createGroupSchool) //Admin

router.route('/:id/update')
 .put(authenticateToken, verifyRoles(roleList.admin), GroupSchoolController.updateGroupSchool) //Admin

router.route('/:id/delete')
 .delete(authenticateToken, verifyRoles(roleList.admin), GroupSchoolController.deleteGroupSchool) //Admin

module.exports = router