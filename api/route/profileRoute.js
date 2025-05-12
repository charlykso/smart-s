const express = require('express');
const profileController = require('../controller/profile_view');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const roleList = require('../helpers/roleList');
const verifyRoles = require('../middleware/verifyRoles')

router.route('/all')
    .get(authenticateToken, verifyRoles(roleList.admin), profileController.getAllUserProfile)
router.route('/:id/get')
    .get(authenticate, verifyRoles(roleList.User), profileController.getUserProfile)
router.post('/:id/upload', profileController.postProfileImage);
router.route('/:id/update')
    .put(authenticate, verifyRoles(roleList.User), profileController.updateUserProfile)
router.route('/:id/delete')
    .delete(authenticate, verifyRoles(roleList.User), profileController.deleteUserProfile)

module.exports = router;