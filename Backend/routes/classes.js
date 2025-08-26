const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const Class = require('../models/Class');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validate, commonValidations } = require('../middleware/validate');

// @desc    Get all classes (with pagination and filtering)
// @route   GET /api/classes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.course) filter.course = req.query.course;
    if (req.query.instructor) filter.instructor = req.query.instructor;
    if (req.query.date) {
      const date = new Date(req.query.date);
      filter.startTime = {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      };
    }

    // Students can only see classes they're enrolled in
    if (req.user.role === 'student') {
      filter['students.student'] = req.user._id;
    }
    // Teachers can only see their own classes
    else if (req.user.role === 'teacher') {
      filter.instructor = req.user._id;
    }

    const classes = await Class.find(filter)
      .populate('course', 'title category')
      .populate('instructor', 'name email profileImage')
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Class.countDocuments(filter);

    res.json({
      success: true,
      data: {
        classes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      error: 'Failed to fetch classes',
      message: 'An error occurred while fetching classes'
    });
  }
});

// @desc    Get class by ID
// @route   GET /api/classes/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('course', 'title category description')
      .populate('instructor', 'name email profileImage bio')
      .populate('students.student', 'name email profileImage')
      .populate('attendance.student', 'name email profileImage');

    if (!classItem) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The specified class could not be found'
      });
    }

    // Check access permissions
    if (req.user.role === 'student') {
      const isEnrolled = classItem.students.some(
        student => student.student._id.toString() === req.user._id.toString()
      );
      if (!isEnrolled) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not enrolled in this class'
        });
      }
    } else if (req.user.role === 'teacher' && classItem.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own classes'
      });
    }

    res.json({
      success: true,
      data: {
        class: classItem
      }
    });

  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      error: 'Failed to fetch class',
      message: 'An error occurred while fetching class data'
    });
  }
});

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Teachers and Admins only)
router.post('/', protect, authorize('teacher', 'admin'), [
  body('title').isLength({ min: 3, max: 100 }).withMessage('Class title must be between 3 and 100 characters'),
  body('description').isLength({ min: 10, max: 500 }).withMessage('Class description must be between 10 and 500 characters'),
  body('course').isMongoId().withMessage('Valid course ID is required'),
  body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime').isISO8601().withMessage('End time must be a valid ISO 8601 date'),
  body('maxStudents').optional().isInt({ min: 1 }).withMessage('Maximum students must be a positive integer'),
  validate
], async (req, res) => {
  try {
    const { course: courseId, startTime, endTime } = req.body;

    // Verify course exists and user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The specified course could not be found'
      });
    }

    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only create classes for your own courses'
      });
    }

    // Check if end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        error: 'Invalid time range',
        message: 'End time must be after start time'
      });
    }

    const classData = {
      ...req.body,
      instructor: req.user._id
    };

    const classItem = await Class.create(classData);

    // Populate course and instructor for response
    await classItem.populate('course', 'title category');
    await classItem.populate('instructor', 'name email');

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: {
        class: classItem
      }
    });

  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      error: 'Failed to create class',
      message: 'An error occurred while creating the class'
    });
  }
});

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Class instructor or Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The specified class could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && classItem.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own classes'
      });
    }

    // Check if class has already started
    if (classItem.status !== 'scheduled' && new Date() > classItem.startTime) {
      return res.status(400).json({
        error: 'Cannot update class',
        message: 'Cannot update a class that has already started'
      });
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'startTime', 'endTime', 'maxStudents', 'meetingLink', 'meetingPassword', 'meetingPlatform', 'notes', 'homework', 'tags', 'settings'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        classItem[field] = req.body[field];
      }
    });

    await classItem.save();

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: {
        class: classItem
      }
    });

  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      error: 'Failed to update class',
      message: 'An error occurred while updating the class'
    });
  }
});

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Class instructor or Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The specified class could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && classItem.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own classes'
      });
    }

    // Check if class has already started
    if (new Date() > classItem.startTime) {
      return res.status(400).json({
        error: 'Cannot delete class',
        message: 'Cannot delete a class that has already started'
      });
    }

    await Class.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });

  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      error: 'Failed to delete class',
      message: 'An error occurred while deleting the class'
    });
  }
});

// @desc    Enroll student in class
// @route   POST /api/classes/:id/enroll
// @access  Private
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The specified class could not be found'
      });
    }

    // Check if class is open for enrollment
    if (!classItem.canEnroll) {
      return res.status(400).json({
        error: 'Cannot enroll',
        message: 'This class is not open for enrollment'
      });
    }

    // Check if student is already enrolled
    const isEnrolled = classItem.students.some(
      student => student.student.toString() === req.user._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        error: 'Already enrolled',
        message: 'You are already enrolled in this class'
      });
    }

    // Enroll student
    await classItem.addStudent(req.user._id);

    res.json({
      success: true,
      message: 'Successfully enrolled in class',
      data: {
        class: classItem
      }
    });

  } catch (error) {
    console.error('Enroll in class error:', error);
    res.status(500).json({
      error: 'Failed to enroll in class',
      message: 'An error occurred while enrolling in the class'
    });
  }
});

// @desc    Unenroll student from class
// @route   DELETE /api/classes/:id/enroll
// @access  Private
router.delete('/:id/enroll', protect, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The specified class could not be found'
      });
    }

    // Check if class has already started
    if (new Date() > classItem.startTime) {
      return res.status(400).json({
        error: 'Cannot unenroll',
        message: 'Cannot unenroll from a class that has already started'
      });
    }

    // Unenroll student
    await classItem.removeStudent(req.user._id);

    res.json({
      success: true,
      message: 'Successfully unenrolled from class'
    });

  } catch (error) {
    console.error('Unenroll from class error:', error);
    res.status(500).json({
      error: 'Failed to unenroll from class',
      message: 'An error occurred while unenrolling from the class'
    });
  }
});

// @desc    Mark attendance
// @route   POST /api/classes/:id/attendance
// @access  Private (Class instructor or Admin only)
router.post('/:id/attendance', protect, [
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid attendance status'),
  body('notes').optional().isLength({ max: 200 }).withMessage('Notes cannot be more than 200 characters'),
  validate
], async (req, res) => {
  try {
    const { studentId, status, notes } = req.body;

    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The specified class could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && classItem.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only mark attendance for your own classes'
      });
    }

    // Check if student is enrolled
    const isEnrolled = classItem.students.some(
      student => student.student.toString() === studentId
    );

    if (!isEnrolled) {
      return res.status(400).json({
        error: 'Student not enrolled',
        message: 'This student is not enrolled in the class'
      });
    }

    // Mark attendance
    await classItem.markAttendance(studentId, status, notes);

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        class: classItem
      }
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      error: 'Failed to mark attendance',
      message: 'An error occurred while marking attendance'
    });
  }
});

// @desc    Update class status
// @route   PATCH /api/classes/:id/status
// @access  Private (Class instructor or Admin only)
router.patch('/:id/status', protect, [
  body('status').isIn(['scheduled', 'in-progress', 'completed', 'cancelled', 'postponed']).withMessage('Invalid status'),
  validate
], async (req, res) => {
  try {
    const { status } = req.body;

    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The specified class could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && classItem.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update status for your own classes'
      });
    }

    // Update status
    await classItem.updateStatus(status);

    res.json({
      success: true,
      message: 'Class status updated successfully',
      data: {
        class: classItem
      }
    });

  } catch (error) {
    console.error('Update class status error:', error);
    res.status(500).json({
      error: 'Failed to update class status',
      message: 'An error occurred while updating the class status'
    });
  }
});

// @desc    Get upcoming classes
// @route   GET /api/classes/upcoming
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    let filter = {};
    
    // Students can only see classes they're enrolled in
    if (req.user.role === 'student') {
      filter['students.student'] = req.user._id;
    }
    // Teachers can only see their own classes
    else if (req.user.role === 'teacher') {
      filter.instructor = req.user._id;
    }

    const upcomingClasses = await Class.findUpcoming()
      .populate('course', 'title category')
      .populate('instructor', 'name email profileImage')
      .limit(limit);

    res.json({
      success: true,
      data: {
        classes: upcomingClasses,
        count: upcomingClasses.length
      }
    });

  } catch (error) {
    console.error('Get upcoming classes error:', error);
    res.status(500).json({
      error: 'Failed to fetch upcoming classes',
      message: 'An error occurred while fetching upcoming classes'
    });
  }
});

// @desc    Get class statistics (for instructors)
// @route   GET /api/classes/:id/stats
// @access  Private (Class instructor or Admin only)
router.get('/:id/stats', protect, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('students.student', 'name email')
      .populate('attendance.student', 'name email');

    if (!classItem) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The specified class could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && classItem.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view statistics for your own classes'
      });
    }

    // Calculate statistics
    const totalStudents = classItem.students.length;
    const presentCount = classItem.attendance.filter(a => a.status === 'present').length;
    const absentCount = classItem.attendance.filter(a => a.status === 'absent').length;
    const lateCount = classItem.attendance.filter(a => a.status === 'late').length;
    const excusedCount = classItem.attendance.filter(a => a.status === 'excused').length;

    const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

    res.json({
      success: true,
      data: {
        classId: classItem._id,
        title: classItem.title,
        totalStudents,
        attendance: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          excused: excusedCount,
          rate: Math.round(attendanceRate * 100) / 100
        },
        status: classItem.status,
        startTime: classItem.startTime,
        endTime: classItem.endTime
      }
    });

  } catch (error) {
    console.error('Get class stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch class statistics',
      message: 'An error occurred while fetching class statistics'
    });
  }
});

module.exports = router;
