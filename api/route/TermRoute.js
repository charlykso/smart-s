const express = require('express');
const router = express.Router();
const termController = require('../controller/term_view');
const authenticateToken = require('../middleware/authenticateToken');
const verifyRoles = require('../middleware/verifyRoles');
const roleList = require('../helpers/roleList');
const ROLES_LIST = require('../helpers/roleList');

router.route('/all')
    .get(authenticateToken,verifyRoles(roleList.admin, roleList.principal, roleList.proprietor), termController.getAllTerms)
router.route('/:id')
    .get(authenticateToken, verifyRoles(roleList.admin, roleList.principal, roleList.proprietor), termController.getTermById)
router.route('/create')
    .post(authenticateToken, verifyRoles(roleList.admin, roleList.principal, roleList.proprietor), termController.createTerm)
router.route('/:id/update')
    .put(authenticateToken, verifyRoles(roleList.admin, roleList.principal, roleList.proprietor),termController.updateTerm)
router.route('/:id/delete')
    .delete(authenticateToken, verifyRoles(roleList.admin, roleList.principal, roleList.proprietor), termController.deleteTerm)
router.route('/:school_id/sessions/:session_id/terms')
    .get(authenticateToken, verifyRoles(roleList.admin, roleList.principal, roleList.proprietor), termController.getTermsBySessionAndSchool)

module.exports = router;
