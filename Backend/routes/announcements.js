const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// @desc    Get active announcements (public)
// @route   GET /api/announcements
// @access  Public
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.findActive();
    res.json({ success: true, data: { announcements } });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// @desc    Get all announcements (admin)
// @route   GET /api/announcements/manage
// @access  Private (Admins only)
router.get('/manage', protect, authorize('admin'), async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { announcements } });
  } catch (error) {
    console.error('Manage announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// @desc    Create announcement (admin)
// @route   POST /api/announcements
// @access  Private (Admins only)
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('message').isLength({ min: 3, max: 300 }).withMessage('Message must be 3-300 characters'),
    body('emoji').optional().isLength({ min: 1, max: 10 }).withMessage('Emoji must be 1-10 characters'),
    body('linkUrl').optional().isString(),
    body('isActive').optional().isBoolean(),
    body('priority').optional().isInt({ min: 0, max: 100 }),
    body('startAt').optional().isISO8601().toDate(),
    body('endAt').optional().isISO8601().toDate(),
    validate,
  ],
  async (req, res) => {
    try {
      const announcement = await Announcement.create({
        message: req.body.message,
        emoji: req.body.emoji || '📢',
        linkUrl: req.body.linkUrl || '',
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        priority: req.body.priority ?? 0,
        startAt: req.body.startAt || null,
        endAt: req.body.endAt || null,
        createdBy: req.user?._id,
      });
      res.status(201).json({ success: true, message: 'Announcement created', data: { announcement } });
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({ error: 'Failed to create announcement' });
    }
  }
);

// @desc    Update announcement (admin)
// @route   PUT /api/announcements/:id
// @access  Private (Admins only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('message').optional().isLength({ min: 3, max: 300 }),
    body('emoji').optional().isLength({ min: 1, max: 10 }),
    body('linkUrl').optional().isString(),
    body('isActive').optional().isBoolean(),
    body('priority').optional().isInt({ min: 0, max: 100 }),
    body('startAt').optional().isISO8601().toDate(),
    body('endAt').optional().isISO8601().toDate(),
    validate,
  ],
  async (req, res) => {
    try {
      const announcement = await Announcement.findById(req.params.id);
      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      const fields = ['message', 'emoji', 'linkUrl', 'isActive', 'priority', 'startAt', 'endAt'];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) announcement[f] = req.body[f];
      });
      await announcement.save();
      res.json({ success: true, message: 'Announcement updated', data: { announcement } });
    } catch (error) {
      console.error('Update announcement error:', error);
      res.status(500).json({ error: 'Failed to update announcement' });
    }
  }
);

// @desc    Delete announcement (admin)
// @route   DELETE /api/announcements/:id
// @access  Private (Admins only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const found = await Announcement.findById(req.params.id);
    if (!found) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;


