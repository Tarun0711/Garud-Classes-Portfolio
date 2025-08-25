const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const {auth} =require('../middleware/auth')
// Get all notifications (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, type, isRead, recipient } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (recipient) filter.recipient = recipient;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('recipient', 'name email')
      .populate('sender', 'name email');

    const total = await Notification.countDocuments(filter);

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
router.post('/', async (req, res) => {
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

    const notificationData = {
      title,
      message,
      type,
      priority,
      sender: req.user.id,
      actionUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    };

    // If recipient is specified, send to specific user
    if (recipient) {
      notificationData.recipient = recipient;
      const notification = new Notification(notificationData);
      await notification.save();
      
      const populatedNotification = await notification.populate([
        { path: 'recipient', select: 'name email' },
        { path: 'sender', select: 'name email' }
      ]);

      return res.status(201).json(populatedNotification);
    }

    // If no recipient specified, send to all users (broadcast)
    const User = require('../models/User');
    const users = await User.find({ role: 'student' }).select('_id');
    
    const notifications = users.map(user => ({
      ...notificationData,
      recipient: user._id
    }));

    const createdNotifications = await Notification.insertMany(notifications);
    
    const populatedNotifications = await Notification.populate(createdNotifications, [
      { path: 'recipient', select: 'name email' },
      { path: 'sender', select: 'name email' }
    ]);

    res.status(201).json({
      message: `Notification sent to ${users.length} users`,
      notifications: populatedNotifications
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
