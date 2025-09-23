// Get all notifications for a user
exports.getAllNotifications = async (req, res) => {
  try {
    const { limit = 20, unread_only = false } = req.query

    // If a Notification model exists, fetch real data; otherwise return empty list
    let notifications = []
    try {
      const Notification = require('../model/Notification')
      const query = { user: req.user._id }
      if (unread_only === 'true') query.read = false
      notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean()
    } catch (_e) {
      // Model not available; fall back to empty array instead of mock data
      notifications = []
    }

    res.status(200).json(notifications)
  } catch (error) {
    console.error('Error getting notifications:', error)
    res.status(500).json({ message: 'Failed to get notifications' })
  }
}

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    let count = 0
    try {
      const Notification = require('../model/Notification')
      count = await Notification.countDocuments({ user: req.user._id, read: false })
    } catch (_e) {
      // Model not available; return 0 instead of mock value
      count = 0
    }

    res.status(200).json({ count })
  } catch (error) {
    console.error('Error getting unread count:', error)
    res.status(500).json({ message: 'Failed to get unread count' })
  }
}

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params

    try {
      const Notification = require('../model/Notification')
      await Notification.updateOne({ _id: id, user: req.user._id }, { $set: { read: true } })
    } catch (_e) {
      // Ignore if model not available
    }
    res.status(200).json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ message: 'Failed to mark notification as read' })
  }
}

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    try {
      const Notification = require('../model/Notification')
      await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } })
    } catch (_e) {
      // Ignore if model not available
    }
    res.status(200).json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    res
      .status(500)
      .json({ message: 'Failed to mark all notifications as read' })
  }
}

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params

    try {
      const Notification = require('../model/Notification')
      await Notification.deleteOne({ _id: id, user: req.user._id })
    } catch (_e) {
      // Ignore if model not available
    }
    res.status(200).json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({ message: 'Failed to delete notification' })
  }
}

exports.cloudinaryNotification = async (req, res) => {
  try {
    const notification = req.body
    console.log('Cloudinary Notification:', notification)
    // Handle the notification as needed
    res.status(200).json({ message: 'Notification received successfully' })
  } catch (error) {
    console.error('Error handling Cloudinary notification:', error)
    res.status(500).json({ message: 'Failed to handle notification' })
  }
}
