const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { singleUpload, handleUploadError, deleteFile } = require('../config/upload');
const Banner = require('../models/Banner');

// @desc    Get all active banners (public)
// @route   GET /api/banners
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('Fetching active banners...');
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('title subtitle image linkUrl tag order');

    console.log('Found banners:', banners.length);

    // Add image URLs to banners
    const bannersWithUrls = banners.map(banner => {
      const bannerObj = banner.toObject();
      bannerObj.imageUrl = `https://garud-classes-portfolio.onrender.com/api/images/${banner.image.filename}`;
      console.log('Banner image URL:', bannerObj.imageUrl);
      return bannerObj;
    });

    res.json({
      success: true,
      data: {
        banners: bannersWithUrls,
        count: bannersWithUrls.length
      }
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      error: 'Failed to fetch banners',
      message: 'An error occurred while fetching banners'
    });
  }
});

// @desc    Get all banners (admin)
// @route   GET /api/banners/manage
// @access  Private (Admin only)
router.get('/manage', protect, authorize('admin'), async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        banners,
        count: banners.length
      }
    });
  } catch (error) {
    console.error('Get all banners error:', error);
    res.status(500).json({
      error: 'Failed to fetch banners',
      message: 'An error occurred while fetching banners'
    });
  }
});

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), singleUpload, (req, res, next) => {
  // Validate required fields
  if (!req.body.title || !req.body.title.trim()) {
    return res.status(400).json({
      error: 'Title is required',
      message: 'Banner title is required and must be between 1 and 100 characters'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      error: 'Image is required',
      message: 'Please upload a banner image'
    });
  }

  // Validate image type
  if (!req.file.mimetype.startsWith('image/')) {
    // Delete uploaded file
    deleteFile(req.file.path);
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only image files are allowed for banners'
    });
  }

  // Validate other fields
  if (req.body.title && req.body.title.length > 100) {
    deleteFile(req.file.path);
    return res.status(400).json({
      error: 'Title too long',
      message: 'Title cannot exceed 100 characters'
    });
  }

  if (req.body.subtitle && req.body.subtitle.length > 200) {
    deleteFile(req.file.path);
    return res.status(400).json({
      error: 'Subtitle too long',
      message: 'Subtitle cannot exceed 200 characters'
    });
  }

  if (req.body.tag && req.body.tag.length > 50) {
    deleteFile(req.file.path);
    return res.status(400).json({
      error: 'Tag too long',
      message: 'Tag cannot exceed 50 characters'
    });
  }

  if (req.body.linkUrl && !req.body.linkUrl.match(/^https?:\/\/.+/)) {
    deleteFile(req.file.path);
    return res.status(400).json({
      error: 'Invalid link URL',
      message: 'Link URL must be a valid URL'
    });
  }

  if (req.body.order && (isNaN(req.body.order) || req.body.order < 0)) {
    deleteFile(req.file.path);
    return res.status(400).json({
      error: 'Invalid order',
      message: 'Order must be a non-negative integer'
    });
  }

  // Create banner with image data
  const bannerData = {
    title: req.body.title.trim(),
    subtitle: req.body.subtitle?.trim() || '',
    image: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    },
    linkUrl: req.body.linkUrl?.trim() || '',
    tag: req.body.tag?.trim() || '',
    isActive: req.body.isActive === 'true' || req.body.isActive === true,
    order: parseInt(req.body.order) || 0
  };

  Banner.create(bannerData)
    .then(banner => {
      res.status(201).json({
        success: true,
        message: 'Banner created successfully',
        data: {
          banner
        }
      });
    })
    .catch(error => {
      // Delete uploaded file if banner creation fails
      deleteFile(req.file.path);
      console.error('Create banner error:', error);
      res.status(500).json({
        error: 'Failed to create banner',
        message: 'An error occurred while creating the banner'
      });
    });
});

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Validate fields
    if (req.body.title && req.body.title.length > 100) {
      return res.status(400).json({
        error: 'Title too long',
        message: 'Title cannot exceed 100 characters'
      });
    }

    if (req.body.subtitle && req.body.subtitle.length > 200) {
      return res.status(400).json({
        error: 'Subtitle too long',
        message: 'Subtitle cannot exceed 200 characters'
      });
    }

    if (req.body.tag && req.body.tag.length > 50) {
      return res.status(400).json({
        error: 'Tag too long',
        message: 'Tag cannot exceed 50 characters'
      });
    }

    if (req.body.linkUrl && !req.body.linkUrl.match(/^https?:\/\/.+/)) {
      return res.status(400).json({
        error: 'Invalid link URL',
        message: 'Link URL must be a valid URL'
      });
    }

    if (req.body.order && (isNaN(req.body.order) || req.body.order < 0)) {
      return res.status(400).json({
        error: 'Invalid order',
        message: 'Order must be a non-negative integer'
      });
    }

    const updateData = { ...req.body };
    
    // Clean up undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({
        error: 'Banner not found',
        message: 'The specified banner could not be found'
      });
    }

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: {
        banner
      }
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      error: 'Failed to update banner',
      message: 'An error occurred while updating the banner'
    });
  }
});

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        error: 'Banner not found',
        message: 'The specified banner could not be found'
      });
    }

    // Delete image file
    if (banner.image && banner.image.path) {
      deleteFile(banner.image.path);
    }

    // Delete banner from database
    await Banner.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      error: 'Failed to delete banner',
      message: 'An error occurred while deleting the banner'
    });
  }
});

// @desc    Toggle banner status
// @route   PATCH /api/banners/:id/toggle
// @access  Private (Admin only)
router.patch('/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        error: 'Banner not found',
        message: 'The specified banner could not be found'
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        banner
      }
    });
  } catch (error) {
    console.error('Toggle banner error:', error);
    res.status(500).json({
      error: 'Failed to toggle banner',
      message: 'An error occurred while toggling the banner'
    });
  }
});

// Error handling middleware for multer
router.use(handleUploadError);

module.exports = router;
