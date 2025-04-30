const express = require('express');
const SchoolController = require('../controller/School_view')
const router = express.Router()

router.get('/all',  SchoolController.getSchools)
router.get('/:id', SchoolController.getSchool)
router.create('/create', SchoolController.createSchool)
router.put('/update', SchoolController.updateSchool)
router.delete('/delete', SchoolController.deleteSchool)
router.get('/by-address/:addressId', SchoolController.getSchoolByAddress)

module.exports = router