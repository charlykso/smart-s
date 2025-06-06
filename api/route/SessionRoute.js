const express = require('express');
const router = express.Router();
const sessionController = require('../controller/session_view');
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles')

router.route('/all')
    .get(authenticateToken, verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor, roleList.Principal,),sessionController.getAllSessions)
router.route('/:school_id/sessions/:session_id/term')
    .get(authenticateToken, verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor, roleList.Principal), sessionController.getTermsBySession)
router.route('/:id')
    .get(authenticateToken, verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor, roleList.Principal), sessionController.getSessionById)
router.route('/create')
    .post(authenticateToken, verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor, roleList.Principal),sessionController.createSession)
router.route('/:id/update')
    .put(authenticateToken, verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor, roleList.Principal), sessionController.updateSession)
router.route('/:id/delete')
    .delete(authenticateToken,verifyRoles(roleList.Admin, roleList.ICT_administrator, roleList.Proprietor, roleList.Principal), sessionController.deleteSession)

module.exports = router;
