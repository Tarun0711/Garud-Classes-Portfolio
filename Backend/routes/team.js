const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { singleUpload, handleUploadError, deleteFile } = require('../config/upload');
const TeamMember = require('../models/Team');

// @desc    Get all active team members (public)
// @route   GET /api/team
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('Fetching active team members...');
    const teamMembers = await TeamMember.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('name position experience specialization image achievements contact color');

    console.log('Found team members:', teamMembers.length);

    // Add image URLs to team members
    const teamMembersWithUrls = teamMembers.map(member => {
      const memberObj = member.toObject();
      memberObj.imageUrl = `/api/images/${member.image.filename}`;
      console.log('Team member image URL:', memberObj.imageUrl);
      return memberObj;
    });

    res.json({
      success: true,
      data: {
        teamMembers: teamMembersWithUrls,
        count: teamMembersWithUrls.length
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      error: 'Failed to fetch team members',
      message: 'An error occurred while fetching team members'
    });
  }
});

// @desc    Get all team members (admin)
// @route   GET /api/team/manage
// @access  Private (Admin only)
router.get('/manage', protect, authorize('admin'), async (req, res) => {
  try {
    const teamMembers = await TeamMember.find()
      .sort({ order: 1, createdAt: -1 });

    // Add image URLs to team members for admin view
    const teamMembersWithUrls = teamMembers.map(member => {
      const memberObj = member.toObject();
      if (member.image && member.image.filename) {
        memberObj.imageUrl = `http://localhost:5000/uploads/images/${member.image.filename}`;
      }
      return memberObj;
    });

    res.json({
      success: true,
      data: {
        teamMembers: teamMembersWithUrls,
        count: teamMembersWithUrls.length
      }
    });
  } catch (error) {
    console.error('Get all team members error:', error);
    res.status(500).json({
      error: 'Failed to fetch team members',
      message: 'An error occurred while fetching team members'
    });
  }
});

// @desc    Create new team member
// @route   POST /api/team
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), singleUpload, (req, res, next) => {
  // Validate required fields
  if (!req.body.name || !req.body.name.trim()) {
    return res.status(400).json({
      error: 'Name is required',
      message: 'Team member name is required and must be between 1 and 100 characters'
    });
  }

  if (!req.body.position || !req.body.position.trim()) {
    return res.status(400).json({
      error: 'Position is required',
      message: 'Position is required and must be between 1 and 100 characters'
    });
  }

  if (!req.body.experience || !req.body.experience.trim()) {
    return res.status(400).json({
      error: 'Experience is required',
      message: 'Experience is required and must be between 1 and 50 characters'
    });
  }

  if (!req.body.specialization || !req.body.specialization.trim()) {
    return res.status(400).json({
      error: 'Specialization is required',
      message: 'Specialization is required and must be between 1 and 100 characters'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      error: 'Image is required',
      message: 'Please upload a team member image'
    });
  }

  // Validate image type
  if (!req.file.mimetype.startsWith('image/')) {
    // Delete uploaded file
    deleteFile(req.file.path);
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only image files are allowed for team members'
    });
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!req.body.email || !emailRegex.test(req.body.email)) {
    deleteFile(req.file.path);
    return res.status(400).json({
      error: 'Invalid email',
      message: 'Please provide a valid email address'
    });
  }

  // Validate phone
  if (!req.body.phone || !req.body.phone.trim()) {
    deleteFile(req.file.path);
    return res.status(400).json({
      error: 'Phone is required',
      message: 'Phone number is required'
    });
  }

  next();
}, async (req, res) => {
  try {
    const {
      name,
      position,
      experience,
      specialization,
      email,
      phone,
      linkedin,
      color,
      isActive,
      order
    } = req.body;

    // Parse achievements if provided
    let achievements = [];
    if (req.body.achievements) {
      try {
        achievements = JSON.parse(req.body.achievements);
        if (!Array.isArray(achievements)) {
          throw new Error('Achievements must be an array');
        }
      } catch (error) {
        deleteFile(req.file.path);
        return res.status(400).json({
          error: 'Invalid achievements format',
          message: 'Achievements must be a valid JSON array'
        });
      }
    }

    const teamMember = new TeamMember({
      name: name.trim(),
      position: position.trim(),
      experience: experience.trim(),
      specialization: specialization.trim(),
      image: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      },
      achievements,
      contact: {
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        linkedin: linkedin ? linkedin.trim() : ''
      },
      color: color || 'from-blue-500 to-purple-600',
      isActive: isActive === 'true' || isActive === true,
      order: parseInt(order) || 0
    });

    const savedTeamMember = await teamMember.save();

    console.log('Team member created:', savedTeamMember._id);

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: {
        teamMember: savedTeamMember
      }
    });
  } catch (error) {
    console.error('Create team member error:', error);
    
    // Delete uploaded file if save fails
    if (req.file) {
      deleteFile(req.file.path);
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate entry',
        message: 'A team member with this email already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to create team member',
      message: 'An error occurred while creating the team member'
    });
  }
});

// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), singleUpload, async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(404).json({
        error: 'Team member not found',
        message: 'The requested team member does not exist'
      });
    }

    const {
      name,
      position,
      experience,
      specialization,
      email,
      phone,
      linkedin,
      color,
      isActive,
      order
    } = req.body;

    // Update basic fields
    if (name) teamMember.name = name.trim();
    if (position) teamMember.position = position.trim();
    if (experience) teamMember.experience = experience.trim();
    if (specialization) teamMember.specialization = specialization.trim();
    if (color) teamMember.color = color.trim();
    if (isActive !== undefined) teamMember.isActive = isActive === 'true' || isActive === true;
    if (order !== undefined) teamMember.order = parseInt(order) || 0;

    // Update contact information
    if (email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        if (req.file) {
          deleteFile(req.file.path);
        }
        return res.status(400).json({
          error: 'Invalid email',
          message: 'Please provide a valid email address'
        });
      }
      teamMember.contact.email = email.trim().toLowerCase();
    }
    if (phone) teamMember.contact.phone = phone.trim();
    if (linkedin !== undefined) teamMember.contact.linkedin = linkedin.trim();

    // Update achievements if provided
    if (req.body.achievements) {
      try {
        const achievements = JSON.parse(req.body.achievements);
        if (!Array.isArray(achievements)) {
          throw new Error('Achievements must be an array');
        }
        teamMember.achievements = achievements;
      } catch (error) {
        if (req.file) {
          deleteFile(req.file.path);
        }
        return res.status(400).json({
          error: 'Invalid achievements format',
          message: 'Achievements must be a valid JSON array'
        });
      }
    }

    // Update image if provided
    if (req.file) {
      // Validate image type
      if (!req.file.mimetype.startsWith('image/')) {
        deleteFile(req.file.path);
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Only image files are allowed for team members'
        });
      }

      // Delete old image
      if (teamMember.image && teamMember.image.path) {
        deleteFile(teamMember.image.path);
      }

      // Update with new image
      teamMember.image = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      };
    }

    const updatedTeamMember = await teamMember.save();

    console.log('Team member updated:', updatedTeamMember._id);

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: {
        teamMember: updatedTeamMember
      }
    });
  } catch (error) {
    console.error('Update team member error:', error);
    
    if (req.file) {
      deleteFile(req.file.path);
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate entry',
        message: 'A team member with this email already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to update team member',
      message: 'An error occurred while updating the team member'
    });
  }
});

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        error: 'Team member not found',
        message: 'The requested team member does not exist'
      });
    }

    // Delete associated image file
    if (teamMember.image && teamMember.image.path) {
      deleteFile(teamMember.image.path);
    }

    await TeamMember.findByIdAndDelete(req.params.id);

    console.log('Team member deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({
      error: 'Failed to delete team member',
      message: 'An error occurred while deleting the team member'
    });
  }
});

// @desc    Toggle team member active status
// @route   PATCH /api/team/:id/toggle
// @access  Private (Admin only)
router.patch('/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        error: 'Team member not found',
        message: 'The requested team member does not exist'
      });
    }

    teamMember.isActive = !teamMember.isActive;
    const updatedTeamMember = await teamMember.save();

    console.log('Team member status toggled:', updatedTeamMember._id, updatedTeamMember.isActive);

    res.json({
      success: true,
      message: `Team member ${updatedTeamMember.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        teamMember: updatedTeamMember
      }
    });
  } catch (error) {
    console.error('Toggle team member error:', error);
    res.status(500).json({
      error: 'Failed to toggle team member status',
      message: 'An error occurred while toggling the team member status'
    });
  }
});

// Error handling middleware for upload errors
router.use(handleUploadError);

module.exports = router;
