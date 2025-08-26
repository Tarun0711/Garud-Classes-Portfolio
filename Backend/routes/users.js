const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validate, commonValidations } = require('../middleware/validate');

// @desc    Get all users (with pagination and filtering)
// @route   GET /api/users
// @access  Private (Admins only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit, 
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'An error occurred while fetching users'
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user could not be found'
      });
    }

    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own profile'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      } 
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: 'An error occurred while fetching user data'
    });
  }
});

// @desc    Update user profile  
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, [
  body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot be more than 500 characters'),
  body('interests').optional().isArray().withMessage('Interests must be an array'),
  body('address').optional().isObject().withMessage('Address must be an object'),
  validate
], async (req, res) => {
  try {
    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own profile'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user could not be found'
      });
    }

    // Update allowed fields
    const allowedFields = ['name', 'phone', 'dateOfBirth', 'gender', 'address', 'bio', 'interests', 'preferences'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating the profile'
    });
  }
});

// @desc    Update user role (Admin only)
// @route   PATCH /api/users/:id/role
// @access  Private (Admins only)
router.patch('/:id/role', protect, authorize('admin'), [
  body('role').isIn(['student', 'teacher', 'admin']).withMessage('Invalid role'),
  validate
], async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user could not be found'
      });
    }

    // Prevent admin from changing their own role
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        error: 'Cannot change own role',
        message: 'You cannot change your own role'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Failed to update user role',
      message: 'An error occurred while updating the user role'
    });
  }
});

// @desc    Toggle user active status (Admin only)
// @route   PATCH /api/users/:id/status
// @access  Private (Admins only)
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user could not be found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        error: 'Cannot deactivate own account',
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      message: 'An error occurred while updating the user status'
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admins only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user could not be found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        error: 'Cannot delete own account',
        message: 'You cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: 'An error occurred while deleting the user'
    });
  }
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats/overview
// @access  Private (Admins only)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        roleStats,
        recentUsers
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      message: 'An error occurred while fetching user statistics'
    });
  }
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, role, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Search query required',
        message: 'Please provide a search query'
      });
    }

    // Build search filter
    const filter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    };

    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('name email role profileImage')
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
        count: users.length,
        query: q
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: 'Failed to search users',
      message: 'An error occurred while searching users'
    });
  }
});

module.exports = router;
