const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { singleUpload, handleUploadError, deleteFile } = require('../config/upload');
const Topper = require('../models/Topper');

// @desc    Get all active toppers (public)
// @route   GET /api/toppers
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('Fetching active toppers...');
    const { category, year, featured, limit = 20 } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (year) {
      query.year = parseInt(year);
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    const toppers = await Topper.find(query)
      .sort({ featured: -1, order: 1, year: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('name exam rank score image course achievement year category featured');

    console.log('Found toppers:', toppers.length);

    // Add image URLs to toppers
    const toppersWithUrls = toppers.map(topper => {
      const topperObj = topper.toObject();
      topperObj.imageUrl = `https://garud-classes-portfolio.onrender.com/uploads/images/${topper.image.filename}`;
      console.log('Topper image URL:', topperObj.imageUrl);
      return topperObj;
    });

    res.json({
      success: true,
      data: {
        toppers: toppersWithUrls,
        count: toppersWithUrls.length
      }
    });
  } catch (error) {
    console.error('Get toppers error:', error);
    res.status(500).json({
      error: 'Failed to fetch toppers',
      message: 'An error occurred while fetching toppers'
    });
  }
});

// @desc    Get all toppers (admin)
// @route   GET /api/toppers/manage
// @access  Private (Admin only)
router.get('/manage', protect, authorize('admin'), async (req, res) => {
  try {
    const toppers = await Topper.find()
      .sort({ featured: -1, order: 1, year: -1, createdAt: -1 });

    // Add image URLs to toppers for admin view
    const toppersWithUrls = toppers.map(topper => {
      const topperObj = topper.toObject();
      if (topper.image && topper.image.filename) {
        topperObj.imageUrl = `https://garud-classes-portfolio.onrender.com/uploads/images/${topper.image.filename}`;
      }
      return topperObj;
    });

    res.json({
      success: true,
      data: {
        toppers: toppersWithUrls,
        count: toppersWithUrls.length
      }
    });
  } catch (error) {
    console.error('Get all toppers error:', error);
    res.status(500).json({
      error: 'Failed to fetch toppers',
      message: 'An error occurred while fetching toppers'
    });
  }
});

// @desc    Create new topper
// @route   POST /api/toppers
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), singleUpload, (req, res, next) => {
  // Validate required fields
  if (!req.body.name || !req.body.name.trim()) {
    return res.status(400).json({
      error: 'Name is required',
      message: 'Student name is required and must be between 1 and 100 characters'
    });
  }

  if (!req.body.exam || !req.body.exam.trim()) {
    return res.status(400).json({
      error: 'Exam is required',
      message: 'Exam name is required and must be between 1 and 100 characters'
    });
  }

  if (!req.body.rank || !req.body.rank.trim()) {
    return res.status(400).json({
      error: 'Rank is required',
      message: 'Rank is required and must be between 1 and 50 characters'
    });
  }

  if (!req.body.score || !req.body.score.trim()) {
    return res.status(400).json({
      error: 'Score is required',
      message: 'Score is required and must be between 1 and 50 characters'
    });
  }

  if (!req.body.course || !req.body.course.trim()) {
    return res.status(400).json({
      error: 'Course is required',
      message: 'Course name is required and must be between 1 and 100 characters'
    });
  }

  if (!req.body.achievement || !req.body.achievement.trim()) {
    return res.status(400).json({
      error: 'Achievement is required',
      message: 'Achievement is required and must be between 1 and 200 characters'
    });
  }

  if (!req.body.year) {
    return res.status(400).json({
      error: 'Year is required',
      message: 'Year is required and must be between 2000 and 2030'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      error: 'Image is required',
      message: 'Student image is required'
    });
  }

  next();
}, async (req, res) => {
  try {
    const {
      name,
      exam,
      rank,
      score,
      course,
      achievement,
      year,
      category = 'Other',
      isActive = true,
      order = 0,
      featured = false
    } = req.body;

    // Create image object
    const image = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    };

    const topper = new Topper({
      name: name.trim(),
      exam: exam.trim(),
      rank: rank.trim(),
      score: score.trim(),
      image,
      course: course.trim(),
      achievement: achievement.trim(),
      year: parseInt(year),
      category,
      isActive: Boolean(isActive),
      order: parseInt(order) || 0,
      featured: Boolean(featured)
    });

    await topper.save();

    // Add image URL to response
    const topperObj = topper.toObject();
    topperObj.imageUrl = `https://garud-classes-portfolio.onrender.com/uploads/images/${image.filename}`;

    res.status(201).json({
      success: true,
      message: 'Topper created successfully',
      data: topperObj
    });
  } catch (error) {
    console.error('Create topper error:', error);
    
    // Delete uploaded file if database operation fails
    if (req.file) {
      try {
        await deleteFile(req.file.path);
      } catch (deleteError) {
        console.error('Failed to delete uploaded file:', deleteError);
      }
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Failed to create topper',
      message: 'An error occurred while creating the topper'
    });
  }
});

// @desc    Update topper
// @route   PUT /api/toppers/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), singleUpload, async (req, res) => {
  try {
    const topper = await Topper.findById(req.params.id);
    
    if (!topper) {
      return res.status(404).json({
        error: 'Topper not found',
        message: 'The requested topper does not exist'
      });
    }

    const {
      name,
      exam,
      rank,
      score,
      course,
      achievement,
      year,
      category,
      isActive,
      order,
      featured
    } = req.body;

    // Update fields if provided
    if (name !== undefined) topper.name = name.trim();
    if (exam !== undefined) topper.exam = exam.trim();
    if (rank !== undefined) topper.rank = rank.trim();
    if (score !== undefined) topper.score = score.trim();
    if (course !== undefined) topper.course = course.trim();
    if (achievement !== undefined) topper.achievement = achievement.trim();
    if (year !== undefined) topper.year = parseInt(year);
    if (category !== undefined) topper.category = category;
    if (isActive !== undefined) topper.isActive = Boolean(isActive);
    if (order !== undefined) topper.order = parseInt(order) || 0;
    if (featured !== undefined) topper.featured = Boolean(featured);

    // Handle image update if new file is uploaded
    if (req.file) {
      // Delete old image file
      if (topper.image && topper.image.path) {
        try {
          await deleteFile(topper.image.path);
        } catch (deleteError) {
          console.error('Failed to delete old image:', deleteError);
        }
      }

      // Update image object
      topper.image = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      };
    }

    await topper.save();

    // Add image URL to response
    const topperObj = topper.toObject();
    topperObj.imageUrl = `https://garud-classes-portfolio.onrender.com/uploads/images/${topper.image.filename}`;

    res.json({
      success: true,
      message: 'Topper updated successfully',
      data: topperObj
    });
  } catch (error) {
    console.error('Update topper error:', error);
    
    // Delete uploaded file if database operation fails
    if (req.file) {
      try {
        await deleteFile(req.file.path);
      } catch (deleteError) {
        console.error('Failed to delete uploaded file:', deleteError);
      }
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Failed to update topper',
      message: 'An error occurred while updating the topper'
    });
  }
});

// @desc    Toggle topper status
// @route   PATCH /api/toppers/:id/toggle
// @access  Private (Admin only)
router.patch('/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const topper = await Topper.findById(req.params.id);
    
    if (!topper) {
      return res.status(404).json({
        error: 'Topper not found',
        message: 'The requested topper does not exist'
      });
    }

    topper.isActive = !topper.isActive;
    await topper.save();

    res.json({
      success: true,
      message: `Topper ${topper.isActive ? 'activated' : 'deactivated'} successfully`,
      data: topper
    });
  } catch (error) {
    console.error('Toggle topper error:', error);
    res.status(500).json({
      error: 'Failed to toggle topper status',
      message: 'An error occurred while toggling the topper status'
    });
  }
});

// @desc    Toggle topper featured status
// @route   PATCH /api/toppers/:id/featured
// @access  Private (Admin only)
router.patch('/:id/featured', protect, authorize('admin'), async (req, res) => {
  try {
    const topper = await Topper.findById(req.params.id);
    
    if (!topper) {
      return res.status(404).json({
        error: 'Topper not found',
        message: 'The requested topper does not exist'
      });
    }

    topper.featured = !topper.featured;
    await topper.save();

    res.json({
      success: true,
      message: `Topper ${topper.featured ? 'featured' : 'unfeatured'} successfully`,
      data: topper
    });
  } catch (error) {
    console.error('Toggle topper featured error:', error);
    res.status(500).json({
      error: 'Failed to toggle topper featured status',
      message: 'An error occurred while toggling the topper featured status'
    });
  }
});

// @desc    Delete topper
// @route   DELETE /api/toppers/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const topper = await Topper.findById(req.params.id);
    
    if (!topper) {
      return res.status(404).json({
        error: 'Topper not found',
        message: 'The requested topper does not exist'
      });
    }

    // Delete image file
    if (topper.image && topper.image.path) {
      try {
        await deleteFile(topper.image.path);
      } catch (deleteError) {
        console.error('Failed to delete image file:', deleteError);
      }
    }

    await Topper.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Topper deleted successfully'
    });
  } catch (error) {
    console.error('Delete topper error:', error);
    res.status(500).json({
      error: 'Failed to delete topper',
      message: 'An error occurred while deleting the topper'
    });
  }
});

// @desc    Get topper statistics
// @route   GET /api/toppers/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await Topper.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalToppers: { $sum: 1 },
          top10Ranks: {
            $sum: {
              $cond: [
                { $regexMatch: { input: '$rank', regex: /AIR [1-9]|AIR 10/i } },
                1,
                0
              ]
            }
          },
          top100Ranks: {
            $sum: {
              $cond: [
                { $regexMatch: { input: '$rank', regex: /AIR [1-9][0-9]|AIR 100/i } },
                1,
                0
              ]
            }
          },
          jeeAdvanced: {
            $sum: { $cond: [{ $eq: ['$category', 'JEE Advanced'] }, 1, 0] }
          },
          jeeMain: {
            $sum: { $cond: [{ $eq: ['$category', 'JEE Main'] }, 1, 0] }
          },
          neet: {
            $sum: { $cond: [{ $eq: ['$category', 'NEET'] }, 1, 0] }
          }
        }
      }
    ]);

    const yearStats = await Topper.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalToppers: 0,
          top10Ranks: 0,
          top100Ranks: 0,
          jeeAdvanced: 0,
          jeeMain: 0,
          neet: 0
        },
        yearStats
      }
    });
  } catch (error) {
    console.error('Get topper stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch topper statistics',
      message: 'An error occurred while fetching topper statistics'
    });
  }
});

module.exports = router;
