const authController = require('../controller/auth_view')
const refreshController = require('../controller/refresh_view')
const express = require('express')

const router = express.Router()

router.post('/login', authController.login)
router.post('/refresh', refreshController.handleRefreshToken)
router.post('/logout', authController.logout)

module.exports = router
