const express = require('express');
const router = express.Router();
const sessionController = require('../controller/session_view');
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles')

router.route('/all')
    .get(authenticateToken, verifyRoles(roleList.admin, roleList.ICT_administrator, roleList.proprietor, roleList.principal,),sessionController.getAllSessions)
router.route('/:school_id/sessions/:session_id/term')
    .get(authenticateToken, verifyRoles(roleList.admin, roleList.ICT_administrator, roleList.proprietor, roleList.principal), sessionController.getTermsBySession)
router.route('/:id')
    .get(authenticateToken, verifyRoles(roleList.admin, roleList.ICT_administrator, roleList.proprietor, roleList.principal), sessionController.getSessionById)
router.route('/create')
    .post(authenticateToken, verifyRoles(roleList.admin, roleList.ICT_administrator, roleList.proprietor, roleList.principal),sessionController.createSession)
router.route('/:id/update')
    .put(authenticateToken, verifyRoles(roleList.admin, roleList.ICT_administrator, roleList.proprietor, roleList.principal), sessionController.updateSession)
router.route('/:id/delete')
    .delete(authenticateToken,verifyRoles(roleList.admin, roleList.ICT_administrator, roleList.proprietor, roleList.principal), sessionController.deleteSession)

module.exports = router;
