// Get all notifications for a user
exports.getAllNotifications = async (req, res) => {
  try {
    const { limit = 20, unread_only = false } = req.query

    // For now, return mock data since we don't have a notification model
    const mockNotifications = [
      {
        _id: '1',
        title: 'Welcome to Smart-S',
        message: 'Welcome to the Smart-S School Management System!',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/dashboard',
      },
      {
        _id: '2',
        title: 'System Update',
        message: 'The system has been updated with new features.',
        type: 'system',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        actionUrl: null,
      },
    ]

    let notifications = mockNotifications
    if (unread_only === 'true') {
      notifications = notifications.filter((n) => !n.read)
    }

    notifications = notifications.slice(0, parseInt(limit))

    res.status(200).json(notifications)
  } catch (error) {
    console.error('Error getting notifications:', error)
    res.status(500).json({ message: 'Failed to get notifications' })
  }
}

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    // For now, return mock count
    const unreadCount = 2

    res.status(200).json({ count: unreadCount })
  } catch (error) {
    console.error('Error getting unread count:', error)
    res.status(500).json({ message: 'Failed to get unread count' })
  }
}

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params

    // For now, just return success
    res.status(200).json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ message: 'Failed to mark notification as read' })
  }
}

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    // For now, just return success
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

    // For now, just return success
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
