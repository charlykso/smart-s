const express = require('express');
const SchoolController = require('../controller/school_view')
const router = express.Router()

router.get('/all',  SchoolController.getSchools)
router.get('/:id', SchoolController.getSchool)
router.post('/create', SchoolController.createSchool)
router.put('/:id/update', SchoolController.updateSchool)
router.delete('/:id/delete', SchoolController.deleteSchool)
router.get('/by-address/:address_id', SchoolController.getSchoolByAddress)
router.get('/by-groupSchool/:groupSchool_id', SchoolController.getSchoolByGroupSchool)

module.exports = router