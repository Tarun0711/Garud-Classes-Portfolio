const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authModule = require('../middleware/auth');

// Resolve auth middleware whether it's exported as { auth } or as default function
let auth = undefined;
if (typeof authModule === 'function') {
  auth = authModule;
} else if (authModule && typeof authModule.auth === 'function') {
  auth = authModule.auth;
}

// Fallback no-op middleware if auth is missing to avoid Express throwing on undefined
const authMiddleware = (typeof auth === 'function') ? auth : (req, res, next) => next();

// Get all notifications (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments();

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});// Create notification (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      recipient,
      priority = 'normal',
      actionUrl,
      expiresAt
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const baseData = {
      title,
      message,
      type,
      priority,
      actionUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      sender: req.user ? req.user.id : null
    };

    // If recipient is an array -> create notification per recipient
    if (Array.isArray(recipient) && recipient.length > 0) {
      const docs = recipient.map(r => ({ ...baseData, recipient: r }));
      const createdNotifications = await Notification.insertMany(docs);
      return res.status(201).json({
        message: `Notification sent to ${createdNotifications.length} user(s)`,
        notifications: createdNotifications
      });
    }

    // If recipient is a single id -> create for that user
    if (recipient) {
      const createdNotification = await Notification.create({ ...baseData, recipient });
      return res.status(201).json({
        message: 'Notification created',
        notification: createdNotification
      });
    }

    // No recipient -> create a single "global" notification (recipient = null)
    const createdNotification = await Notification.create({ ...baseData, recipient: null });
    return res.status(201).json({
      message: 'Global notification created',
      notification: createdNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    ).populate('sender', 'name email');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read for current user
router.patch('/read-all', async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ 
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification (admin or recipient)
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user is admin or the recipient
    if (req.user.role !== 'admin' && notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await notification.remove();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });
    const todayNotifications = await Notification.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Notification.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      total: totalNotifications,
      unread: unreadNotifications,
      today: todayNotifications,
      byType: typeStats,
      byPriority: priorityStats
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
