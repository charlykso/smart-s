const express = require('express');
const profileController = require('../controller/profile_view');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles')

router.route('/all')
    .get(authenticateToken, verifyRoles(roleList.admin), profileController.getAllUserProfile)
router.route('/:id/get')
    .get(authenticateToken, verifyRoles(roleList.User), profileController.getUserProfile)
router.post('/:id/create', profileController.createUserProfile);
router.route('/:id/update')
    .put(authenticateToken, verifyRoles(roleList.User), profileController.updateUserProfile)
router.route('/:id/delete')
    .delete(authenticateToken, verifyRoles(roleList.User), profileController.deleteUserProfile)

module.exports = router;