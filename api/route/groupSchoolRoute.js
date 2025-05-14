const express = require('express')
const groupSchoolController = require('../controller/groupSchool_view')
const authenticateToken = require('../middleware/authenticateToken')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()

router.route('/all')
  .get(authenticateToken, verifyRoles(roleList.admin), groupSchoolController.getGroupSchools) //admin
router.route('/:id')
 .get(authenticateToken, verifyRoles(roleList.admin), groupSchoolController.getGroupSchool) //admin
router.route('/create')
 .post(authenticateToken, verifyRoles(roleList.admin), groupSchoolController.createGroupSchool) //Admin

router.route('/:id/update')
 .put(authenticateToken, verifyRoles(roleList.admin), groupSchoolController.updateGroupSchool) //Admin

router.route('/:id/delete')
 .delete(authenticateToken, verifyRoles(roleList.admin), groupSchoolController.deleteGroupSchool) //Admin

module.exports = router