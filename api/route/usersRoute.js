const express = require('express')
const UserController = require('../controller/charlesUser_view')
const router = express.Router()

router.get('/all',  UserController.getAllUsers)
router.get('/:id', UserController.getUser)
router.post('/create', UserController.createUser)
router.put('/:id/update', UserController.updateUser)
router.delete('/:id/delete', UserController.deleteUser)

module.exports = router
