const express = require('express');
const profileController = require('../controller/profile_view');
const router = express.Router();

router.get('/all', profileController.getAllUserProfile)
router.get('/:id/get', profileController.getUserProfile);
router.post('/:id/upload', profileController.postProfileImage);
router.put('/:id/update', profileController.updateUserProfile);

module.exports = router;