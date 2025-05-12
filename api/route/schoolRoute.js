const express = require('express');
const SchoolController = require('../controller/school_view')
const authenticateToken = require('../middleware/authenticateToken')
const roleList = require('../helpers/roleList')
const verifyRoles = require('../middleware/verifyRoles')
const router = express.Router()

router.get('/all',  SchoolController.getSchools)
router.route('/:id')
 .get(authenticateToken, verifyRoles(roleList.principal), SchoolController.getSchool) //principal
router.route('/create')
 .post(authenticateToken, verifyRoles(roleList.admin), SchoolController.createSchool) //Admin

router.route('/:id/update')
.put(authenticateToken, verifyRoles(roleList.admin), SchoolController.updateSchool) //Admin
router.route('/:id/delete')
 .delete(authenticateToken, verifyRoles(roleList.admin), SchoolController.deleteSchool) //Admin
router.route('/by-address/:address_id')
 .get(authenticateToken, verifyRoles(roleList.principal), SchoolController.getSchoolByAddress) //principal

router.route('/by-groupSchool/:groupSchool_id')
.get(authenticateToken, verifyRoles(roleList.principal), SchoolController.getSchoolByGroupSchool) //principal

module.exports = router