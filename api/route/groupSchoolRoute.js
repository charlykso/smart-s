const express = require('express')
const GroupSchoolController = require('../controller/GroupSchool_view.js')
const router = express.Router()

router.get ('/all', GroupSchoolController.getGroupSchools)
router.get('/:id', GroupSchoolController.getGroupSchool)
router.post('/create', GroupSchoolController.createGroupSchool)
router.put('/:id/update', GroupSchoolController.updateGroupSchool)
router.delete('/:id/delete', GroupSchoolController.deleteGroupSchool)

module.exports = router