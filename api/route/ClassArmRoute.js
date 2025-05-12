const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles');
const classArmController = require('../controller/classArm_view');

router.route('/all')
    .get(authenticateToken, verifyRoles(roleList.admin, roleList.ICT_administrator, roleList.proprietor, roleList.principal,), classArmController.getAllClassArms)
router.route('/:id')
    .get(authenticateToken, verifyRoles(roleList.admin, roleList.ICT_administrator, roleList.proprietor, roleList.principal,),classArmController.getClassArmById)
router.route('/')
    .post(authenticateToken, verifyRoles(roleList.admin, roleList.ICT_administrator, roleList.proprietor, roleList.principal,),classArmController.createClassArm)
router.route('/:id/update')
    .put(authenticateToken, verifyRoles(roleList.admin, roleList.ICT_administrator, roleList.proprietor, roleList.principal,),classArmController.updateClassArm)
router.route('/:id/delete')
    .delete(authenticateToken, verifyRoles(roleList.admin, roleList.ICT_administrator, roleList.proprietor, roleList.principal,),classArmController.deleteClassArm)

module.exports = router;
