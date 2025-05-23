const notification = require('../controller/notification')
const express = require('express')
const router = express.Router()

router.get('/cloudinary', notification.cloudinaryNotification)

module.exports = router