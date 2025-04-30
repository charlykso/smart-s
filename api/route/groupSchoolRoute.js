const express = require('express')
const GroupSchoolController = require('../controller/GroupSchool_view.js')
const router = express.Router()

router.get ('/all', GroupSchoolController.getGroupSchools)
router.get('/:id', GroupSchoolController.getGroupSchool)
router.post('/create', GroupSchoolController.createGroupSchool)
router.put('/update/:id', GroupSchoolController.updateGroupSchool)
router.delete('/delete/:id', GroupSchoolController.deleteGroupSchool)

module.exports = router