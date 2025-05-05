const express = require('express');
const SchoolController = require('../controller/school_view')
const router = express.Router()

router.get('/all',  SchoolController.getSchools)
router.get('/:id', SchoolController.getSchool)
router.post('/create', SchoolController.createSchool)
router.put('/update', SchoolController.updateSchool)
router.delete('/delete', SchoolController.deleteSchool)
router.get('/by-address/:addressId', SchoolController.getSchoolByAddress)
router.get('/by-groupSchool/:groupSchoolId', SchoolController.getSchoolByGroupSchool)

module.exports = router