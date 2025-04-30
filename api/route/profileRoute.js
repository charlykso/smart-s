const express = require('express');
const profileController = require('../controller/profile_view');
const router = express.Router();

router.get('/:id/get', profileController.getUserProfile);
router.upload('/:id/upload', profileController.uploadProfileImage);
router.update('/:id/update', profileController.updateUserProfile);

module.exports = router;