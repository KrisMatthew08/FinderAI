const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get all notifications for current user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            studentId: req.user.studentId 
        })
        .sort({ createdAt: -1 })
        .limit(50);

        const unreadCount = await Notification.countDocuments({ 
            studentId: req.user.studentId,
            read: false 
        });

        res.json({ 
            notifications, 
            unreadCount 
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, studentId: req.user.studentId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// Mark all notifications as read
router.patch('/mark-all-read', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { studentId: req.user.studentId, read: false },
            { read: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            studentId: req.user.studentId
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

module.exports = router;
