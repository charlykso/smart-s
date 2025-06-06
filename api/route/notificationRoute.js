const notification = require('../controller/notification')
const authenticateToken = require('../middleware/authenticateToken')
const express = require('express')
const router = express.Router()

// Get all notifications
router.get('/all', authenticateToken, notification.getAllNotifications)

// Get unread notification count
router.get('/unread-count', authenticateToken, notification.getUnreadCount)

// Mark notification as read
router.post('/:id/mark-read', authenticateToken, notification.markAsRead)

// Mark all notifications as read
router.post('/mark-all-read', authenticateToken, notification.markAllAsRead)

// Delete notification
router.delete('/:id', authenticateToken, notification.deleteNotification)

// Cloudinary webhook (no auth needed)
router.get('/cloudinary', notification.cloudinaryNotification)

module.exports = router
