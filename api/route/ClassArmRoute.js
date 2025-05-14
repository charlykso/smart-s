const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles');
const classArmController = require('../controller/classArm_view');

router.route('/all')
    .get(authenticateToken, verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor, roleList.Principal,), classArmController.getAllClassArms)
router.route('/:id')
    .get(authenticateToken, verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor, roleList.Principal,),classArmController.getClassArmById)
router.route('/')
    .post(authenticateToken, verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor, roleList.Principal,),classArmController.createClassArm)
router.route('/:id/update')
    .put(authenticateToken, verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor, roleList.Principal,),classArmController.updateClassArm)
router.route('/:id/delete')
    .delete(authenticateToken, verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor, roleList.Principal,),classArmController.deleteClassArm)

module.exports = router;
