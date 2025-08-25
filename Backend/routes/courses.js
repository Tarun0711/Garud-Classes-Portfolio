const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const Course = require('../models/Course');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validate, commonValidations } = require('../middleware/validate');
const { upload } = require('../config/upload');

// @desc    Get all courses (with pagination and filtering)
// @route   GET /api/courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isPublished: true, status: 'published' };
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.level) filter.level = req.query.level;
    if (req.query.instructor) filter.instructor = req.query.instructor;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.priceRange) {
      const [min, max] = req.query.priceRange.split('-');
      filter.price = {};
      if (min) filter.price.$gte = parseFloat(min);
      if (max) filter.price.$lte = parseFloat(max);
    }

    // Build sort object
    let sort = {};
    if (req.query.sortBy === 'price') sort.price = req.query.sortOrder === 'desc' ? -1 : 1;
    else if (req.query.sortBy === 'rating') sort['rating.average'] = req.query.sortOrder === 'desc' ? -1 : 1;
    else if (req.query.sortBy === 'enrollment') sort.enrollmentCount = req.query.sortOrder === 'desc' ? -1 : 1;
    else sort.createdAt = -1; // Default sort

    const courses = await Course.find(filter)
      .populate('instructor', 'name email profileImage')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      error: 'Failed to fetch courses',
      message: 'An error occurred while fetching courses'
    });
  }
});

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email profileImage bio')
      .populate('reviews.user', 'name profileImage');

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The specified course could not be found'
      });
    }

    // Only show published courses to public
    if (!course.isPublished || course.status !== 'published') {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The specified course could not be found'
      });
    }

    res.json({
      success: true,
      data: {
        course
      }
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      error: 'Failed to fetch course',
      message: 'An error occurred while fetching course data'
    });
  }
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Teachers and Admins only)
router.post('/', protect, authorize('teacher', 'admin'), upload.single('thumbnail'), async (req, res) => {
  try {
    // Handle file upload if present
    let thumbnail = null;
    if (req.file) {
      thumbnail = req.file.filename;
    }
    
    // Also check for thumbnail field specifically
    if (req.body.thumbnail && req.file) {
      thumbnail = req.file.filename;
    }

    // Parse JSON fields if they exist
    let tags = [];
    let requirements = [];
    let learningOutcomes = [];

    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    if (req.body.requirements) {
      try {
        requirements = JSON.parse(req.body.requirements);
      } catch (e) {
        requirements = req.body.requirements.split(',').map(req => req.trim()).filter(req => req);
      }
    }

    if (req.body.learningOutcomes) {
      try {
        learningOutcomes = JSON.parse(req.body.learningOutcomes);
      } catch (e) {
        learningOutcomes = req.body.learningOutcomes.split(',').map(outcome => outcome.trim()).filter(outcome => outcome);
      }
    }

    const courseData = {
      title: req.body.title,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      category: req.body.category,
      level: req.body.level,
      price: parseFloat(req.body.price) || 0,
      currency: req.body.currency || 'INR',
      duration: parseFloat(req.body.duration) || 0,
      maxEnrollment: parseInt(req.body.maxEnrollment) || 30,
      isPublished: req.body.isPublished === 'true',
      isFeatured: req.body.isFeatured === 'true',
      tags,
      requirements,
      learningOutcomes,
      thumbnail,
      instructor: req.user._id
    };

    const course = await Course.create(courseData);

    // Populate instructor details
    await course.populate('instructor', 'name email profileImage');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course
      }
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      error: 'Failed to create course',
      message: 'An error occurred while creating the course'
    });
  }
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Course instructor or Admin only)
router.put('/:id', protect, upload.single('thumbnail'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The specified course could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own courses'
      });
    }

    // Handle file upload if present
    if (req.file) {
      course.thumbnail = req.file.filename;
    }

    // Parse JSON fields if they exist
    if (req.body.tags) {
      try {
        course.tags = JSON.parse(req.body.tags);
      } catch (e) {
        course.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    if (req.body.requirements) {
      try {
        course.requirements = JSON.parse(req.body.requirements);
      } catch (e) {
        course.requirements = req.body.requirements.split(',').map(req => req.trim()).filter(req => req);
      }
    }

    if (req.body.learningOutcomes) {
      try {
        course.learningOutcomes = JSON.parse(req.body.learningOutcomes);
      } catch (e) {
        course.learningOutcomes = req.body.learningOutcomes.split(',').map(outcome => outcome.trim()).filter(outcome => outcome);
      }
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'shortDescription', 'category', 'subcategory', 'level', 'price', 'currency', 'duration', 'maxEnrollment', 'isPublished', 'isFeatured'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'price' || field === 'duration' || field === 'maxEnrollment') {
          course[field] = parseFloat(req.body[field]) || 0;
        } else if (field === 'isPublished' || field === 'isFeatured') {
          course[field] = req.body[field] === 'true';
        } else {
          course[field] = req.body[field];
        }
      }
    });

    await course.save();

    // Populate instructor details
    await course.populate('instructor', 'name email profileImage');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course
      }
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      error: 'Failed to update course',
      message: 'An error occurred while updating the course'
    });
  }
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Course instructor or Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The specified course could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own courses'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      error: 'Failed to delete course',
      message: 'An error occurred while deleting the course'
    });
  }
});

// @desc    Publish/Unpublish course
// @route   PATCH /api/courses/:id/publish
// @access  Private (Course instructor or Admin only)
router.patch('/:id/publish', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The specified course could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only publish/unpublish your own courses'
      });
    }

    course.isPublished = !course.isPublished;
    course.status = course.isPublished ? 'published' : 'draft';
    
    await course.save();

    res.json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      data: {
        course
      }
    });

  } catch (error) {
    console.error('Toggle course publish error:', error);
    res.status(500).json({
      error: 'Failed to update course status',
      message: 'An error occurred while updating the course status'
    });
  }
});

// @desc    Add course material
// @route   POST /api/courses/:id/materials
// @access  Private (Course instructor or Admin only)
router.post('/:id/materials', protect, [
  body('title').notEmpty().withMessage('Material title is required'),
  body('type').isIn(['document', 'video', 'audio', 'link', 'other']).withMessage('Invalid material type'),
  body('fileUrl').optional().isURL().withMessage('File URL must be a valid URL'),
  body('externalUrl').optional().isURL().withMessage('External URL must be a valid URL'),
  validate
], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The specified course could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only add materials to your own courses'
      });
    }

    const material = {
      title: req.body.title,
      type: req.body.type,
      fileUrl: req.body.fileUrl,
      externalUrl: req.body.externalUrl,
      description: req.body.description,
      size: req.body.size
    };

    course.materials.push(material);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course material added successfully',
      data: {
        material: course.materials[course.materials.length - 1]
      }
    });

  } catch (error) {
    console.error('Add course material error:', error);
    res.status(500).json({
      error: 'Failed to add course material',
      message: 'An error occurred while adding the course material'
    });
  }
});

// @desc    Remove course material
// @route   DELETE /api/courses/:id/materials/:materialId
// @access  Private (Course instructor or Admin only)
router.delete('/:id/materials/:materialId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The specified course could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only remove materials from your own courses'
      });
    }

    const materialIndex = course.materials.findIndex(
      material => material._id.toString() === req.params.materialId
    );

    if (materialIndex === -1) {
      return res.status(404).json({
        error: 'Material not found',
        message: 'The specified material could not be found'
      });
    }

    course.materials.splice(materialIndex, 1);
    await course.save();

    res.json({
      success: true,
      message: 'Course material removed successfully'
    });

  } catch (error) {
    console.error('Remove course material error:', error);
    res.status(500).json({
      error: 'Failed to remove course material',
      message: 'An error occurred while removing the course material'
    });
  }
});

// @desc    Add course review
// @route   POST /api/courses/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot be more than 500 characters'),
  validate
], async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The specified course could not be found'
      });
    }

    // Check if course is published
    if (!course.isPublished || course.status !== 'published') {
      return res.status(400).json({
        error: 'Cannot review unpublished course',
        message: 'You can only review published courses'
      });
    }

    // Add review
    await course.addReview(req.user._id, rating, comment);

    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        course: {
          rating: course.rating,
          reviews: course.reviews
        }
      }
    });

  } catch (error) {
    console.error('Add course review error:', error);
    res.status(500).json({
      error: 'Failed to add review',
      message: 'An error occurred while adding the review'
    });
  }
});

// @desc    Get featured courses
// @route   GET /api/courses/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const featuredCourses = await Course.find({ 
      isFeatured: true, 
      isPublished: true, 
      status: 'published' 
    })
    .populate('instructor', 'name email profileImage')
    .sort({ createdAt: -1 })
    .limit(limit);

    res.json({
      success: true,
      data: {
        courses: featuredCourses,
        count: featuredCourses.length
      }
    });

  } catch (error) {
    console.error('Get featured courses error:', error);
    res.status(500).json({
      error: 'Failed to fetch featured courses',
      message: 'An error occurred while fetching featured courses'
    });
  }
});

// @desc    Get courses by category
// @route   GET /api/courses/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.findByCategory(req.params.category)
      .populate('instructor', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments({ 
      category: req.params.category, 
      isPublished: true, 
      status: 'published' 
    });

    res.json({
      success: true,
      data: {
        category: req.params.category,
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get courses by category error:', error);
    res.status(500).json({
      error: 'Failed to fetch courses by category',
      message: 'An error occurred while fetching courses by category'
    });
  }
});

// @desc    Search courses
// @route   GET /api/courses/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, category, level, priceRange, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Search query required',
        message: 'Please provide a search query'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const filter = {
      $text: { $search: q },
      isPublished: true,
      status: 'published'
    };

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      filter.price = {};
      if (min) filter.price.$gte = parseFloat(min);
      if (max) filter.price.$lte = parseFloat(max);
    }

    // Build sort object
    let sort = {};
    if (sortBy === 'price') sort.price = sortOrder === 'desc' ? -1 : 1;
    else if (sortBy === 'rating') sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
    else if (sortBy === 'relevance') sort.score = { $meta: 'textScore' };
    else sort.createdAt = -1;

    const courses = await Course.find(filter)
      .populate('instructor', 'name email profileImage')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: {
        query: q,
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Search courses error:', error);
    res.status(500).json({
      error: 'Failed to search courses',
      message: 'An error occurred while searching courses'
    });
  }
});

// @desc    Update course status
// @route   PATCH /api/courses/:id/status
// @access  Private (Admin only)
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['draft', 'published', 'archived', 'suspended'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: draft, published, archived, suspended'
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email profileImage');

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The specified course could not be found'
      });
    }

    res.json({
      success: true,
      data: {
        course
      }
    });

  } catch (error) {
    console.error('Update course status error:', error);
    res.status(500).json({
      error: 'Failed to update course status',
      message: 'An error occurred while updating course status'
    });
  }
});

// @desc    Get all courses for admin management
// @route   GET /api/courses/manage
// @access  Private (Admin only)
router.get('/manage', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter object - no restrictions for admin
    const filter = {};
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.level) filter.level = req.query.level;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.instructor) filter.instructor = req.query.instructor;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort object
    let sort = {};
    if (req.query.sortBy === 'price') sort.price = req.query.sortOrder === 'desc' ? -1 : 1;
    else if (req.query.sortBy === 'rating') sort['rating.average'] = req.query.sortOrder === 'desc' ? -1 : 1;
    else if (req.query.sortBy === 'enrollment') sort.enrollmentCount = req.query.sortOrder === 'desc' ? -1 : 1;
    else sort.createdAt = -1; // Default sort

    const courses = await Course.find(filter)
      .populate('instructor', 'name email profileImage')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get courses for admin error:', error);
    res.status(500).json({
      error: 'Failed to fetch courses',
      message: 'An error occurred while fetching courses'
    });
  }
});

module.exports = router;
