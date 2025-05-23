
exports.cloudinaryNotification = async (req, res) => {
    try {
        const notification = req.body;
        console.log('Cloudinary Notification:', notification);
        // Handle the notification as needed
        res.status(200).json({ message: 'Notification received successfully' });
    } catch (error) {
        console.error('Error handling Cloudinary notification:', error);
        res.status(500).json({ message: 'Failed to handle notification' });
    }
};
