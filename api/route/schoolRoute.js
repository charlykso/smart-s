const express = require('express');
const schoolController = require('../controller/school_view')
const authenticateToken = require('../middleware/authenticateToken')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()

router.get('/all',  schoolController.getSchools)
router.route('/:id')
 .get(authenticateToken, verifyRoles(roleList.principal, roleList.student, roleList.ICT_administrator, roleList.headteacher, roleList.proprietor, roleList.admin), schoolController.getSchool) //principal
router.route('/create')
 .post(authenticateToken, verifyRoles(roleList.admin), schoolController.createSchool) //Admin

router.route('/:id/update')
.put(authenticateToken, verifyRoles(roleList.admin), schoolController.updateSchool) //Admin
router.route('/:id/delete')
 .delete(authenticateToken, verifyRoles(roleList.admin), schoolController.deleteSchool) //Admin
router.route('/by-address/:address_id')
 .get(authenticateToken, verifyRoles(roleList.principal, roleList.admin), schoolController.getSchoolByAddress) //principal

router.route('/by-groupSchool/:groupSchool_id')
.get(authenticateToken, verifyRoles(roleList.principal, roleList.admin), schoolController.getSchoolByGroupSchool) //principal

module.exports = router