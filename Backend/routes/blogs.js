const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const Blog = require('../models/Blog');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { singleUpload, deleteFile } = require('../config/upload');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, featured } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isPublished: true, publishedAt: { $lte: new Date() } };
    
    if (category && category !== 'All Posts') {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const blogs = await Blog.find(query)
      .populate('author', 'name email profileImage')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: skip + blogs.length < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// @desc    Get featured blogs (public)
// @route   GET /api/blogs/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const blogs = await Blog.findFeatured()
      .populate('author', 'name email profileImage')
      .limit(5);
    
    res.json({ success: true, data: { blogs } });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch featured blogs' });
  }
});

// @desc    Get blog categories (public)
// @route   GET /api/blogs/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { isPublished: true });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// @desc    Get single blog by slug (public)
// @route   GET /api/blogs/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug,
      isPublished: true,
      publishedAt: { $lte: new Date() }
    }).populate('author', 'name email profileImage');
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Increment view count
    await blog.incrementViewCount();
    
    res.json({ success: true, data: { blog } });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// @desc    Get all blogs (admin)
// @route   GET /api/blogs/manage/all
// @access  Private (Admins only)
router.get('/manage/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (status) {
      if (status === 'published') {
        query.isPublished = true;
      } else if (status === 'draft') {
        query.isPublished = false;
      }
    }
    
    if (category && category !== 'All Posts') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const blogs = await Blog.find(query)
      .populate('author', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: skip + blogs.length < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Manage blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// @desc    Get single blog for editing (admin)
// @route   GET /api/blogs/manage/:id
// @access  Private (Admins only)
router.get('/manage/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name email profileImage');
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json({ success: true, data: { blog } });
  } catch (error) {
    console.error('Get blog for editing error:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// @desc    Create blog (admin)
// @route   POST /api/blogs
// @access  Private (Admins only)
router.post(
  '/',
  protect,
  authorize('admin'),
  singleUpload,
  [
    body('title').isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
    body('excerpt').isLength({ min: 10, max: 500 }).withMessage('Excerpt must be 10-500 characters'),
    body('content').isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
    body('category').isIn([
      'JEE Preparation',
      'NEET Preparation', 
      'Study Material',
      'Test Strategy',
      'Chemistry',
      'Physics',
      'Mathematics',
      'Biology',
      'Exam Strategy',
      'Success Stories',
      'Tips & Tricks',
      'Other'
    ]).withMessage('Invalid category'),
    // body('tags').optional().isArray(),
    body('readTime').optional().isInt({ min: 1, max: 120 }),
    body('isPublished').optional().isBoolean(),
    body('isFeatured').optional().isBoolean(),
    body('metaTitle').optional().isLength({ max: 160 }),
    body('metaDescription').optional().isLength({ max: 360 }),
    validate,
  ],
  async (req, res) => {
    try {
      // Handle image upload
      let featuredImage = null;
      if (req.file) {
        // Validate image type
        if (!req.file.mimetype.startsWith('image/')) {
          // Delete uploaded file
          deleteFile(req.file.path);
          return res.status(400).json({ 
            error: 'Invalid file type',
            message: 'Only image files are allowed for blog featured images'
          });
        }
        
        featuredImage = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        };
      }

      const blog = await Blog.create({
        title: req.body.title,
        slug: req.body.slug,
        excerpt: req.body.excerpt,
        content: req.body.content,
        author: req.user._id,
        category: req.body.category,
        tags: req.body.tags || [],
        featuredImage,
        readTime: req.body.readTime || 5,
        isPublished: req.body.isPublished || false,
        isFeatured: req.body.isFeatured || false,
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,
        createdBy: req.user._id,
      });
      
      const populatedBlog = await blog.populate('author', 'name email profileImage');
      
      res.status(201).json({ 
        success: true, 
        message: 'Blog created successfully', 
        data: { blog: populatedBlog } 
      });
    } catch (error) {
      console.error('Create blog error:', error);
      
      // Delete uploaded file if database operation fails
      if (req.file) {
        try {
          await deleteFile(req.file.path);
        } catch (deleteError) {
          console.error('Failed to delete uploaded file:', deleteError);
        }
      }
      
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Blog with this slug already exists' });
      }
      res.status(500).json({ error: 'Failed to create blog' });
    }
  }
);

// @desc    Update blog (admin)
// @route   PUT /api/blogs/:id
// @access  Private (Admins only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  singleUpload,
  [
    body('title').optional().isLength({ min: 3, max: 200 }),
    body('excerpt').optional().isLength({ min: 10, max: 500 }),
    body('content').optional().isLength({ min: 50 }),
    body('category').optional().isIn([
      'JEE Preparation',
      'NEET Preparation', 
      'Study Material',
      'Test Strategy',
      'Chemistry',
      'Physics',
      'Mathematics',
      'Biology',
      'Exam Strategy',
      'Success Stories',
      'Tips & Tricks',
      'Other'
    ]),
    body('tags').optional().isArray(),
    body('readTime').optional().isInt({ min: 1, max: 120 }),
    body('isPublished').optional().isBoolean(),
    body('isFeatured').optional().isBoolean(),
    body('metaTitle').optional().isLength({ max: 60 }),
    body('metaDescription').optional().isLength({ max: 160 }),
    validate,
  ],
  async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }
      
      // Handle image upload
      if (req.file) {
        // Validate image type
        if (!req.file.mimetype.startsWith('image/')) {
          // Delete uploaded file
          deleteFile(req.file.path);
          return res.status(400).json({ 
            error: 'Invalid file type',
            message: 'Only image files are allowed for blog featured images'
          });
        }
        
        // Delete old image if exists
        if (blog.featuredImage && blog.featuredImage.path) {
          try {
            await deleteFile(blog.featuredImage.path);
          } catch (deleteError) {
            console.error('Failed to delete old image:', deleteError);
          }
        }
        
        // Update with new image
        blog.featuredImage = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        };
      }
      
      const fields = [
        'title', 'slug', 'excerpt', 'content', 'category', 'tags', 
        'readTime', 'isPublished', 'isFeatured', 'metaTitle', 'metaDescription'
      ];
      
      fields.forEach((field) => {
        if (req.body[field] !== undefined) {
          blog[field] = req.body[field];
        }
      });
      
      await blog.save();
      
      const updatedBlog = await blog.populate('author', 'name email profileImage');
      
      res.json({ 
        success: true, 
        message: 'Blog updated successfully', 
        data: { blog: updatedBlog } 
      });
    } catch (error) {
      console.error('Update blog error:', error);
      
      // Delete uploaded file if database operation fails
      if (req.file) {
        try {
          await deleteFile(req.file.path);
        } catch (deleteError) {
          console.error('Failed to delete uploaded file:', deleteError);
        }
      }
      
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Blog with this slug already exists' });
      }
      res.status(500).json({ error: 'Failed to update blog' });
    }
  }
);

// @desc    Delete blog (admin)
// @route   DELETE /api/blogs/:id
// @access  Private (Admins only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Delete associated image if exists
    if (blog.featuredImage && blog.featuredImage.path) {
      try {
        await deleteFile(blog.featuredImage.path);
      } catch (deleteError) {
        console.error('Failed to delete blog image:', deleteError);
      }
    }
    
    await blog.deleteOne();
    
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// @desc    Toggle blog published status (admin)
// @route   PATCH /api/blogs/:id/toggle-published
// @access  Private (Admins only)
router.patch('/:id/toggle-published', protect, authorize('admin'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    blog.isPublished = !blog.isPublished;
    if (blog.isPublished && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    
    await blog.save();
    
    const updatedBlog = await blog.populate('author', 'name email profileImage');
    
    res.json({ 
      success: true, 
      message: `Blog ${blog.isPublished ? 'published' : 'unpublished'} successfully`, 
      data: { blog: updatedBlog } 
    });
  } catch (error) {
    console.error('Toggle blog published error:', error);
    res.status(500).json({ error: 'Failed to toggle blog published status' });
  }
});

// @desc    Toggle blog featured status (admin)
// @route   PATCH /api/blogs/:id/toggle-featured
// @access  Private (Admins only)
router.patch('/:id/toggle-featured', protect, authorize('admin'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    blog.isFeatured = !blog.isFeatured;
    await blog.save();
    
    const updatedBlog = await blog.populate('author', 'name email profileImage');
    
    res.json({ 
      success: true, 
      message: `Blog ${blog.isFeatured ? 'featured' : 'unfeatured'} successfully`, 
      data: { blog: updatedBlog } 
    });
  } catch (error) {
    console.error('Toggle blog featured error:', error);
    res.status(500).json({ error: 'Failed to toggle blog featured status' });
  }
});

module.exports = router;
