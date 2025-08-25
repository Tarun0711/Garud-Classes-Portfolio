const { validationResult } = require('express-validator');

// Middleware to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

// Common validation rules
const commonValidations = {
  // User validations
  user: {
    name: {
      notEmpty: { errorMessage: 'Name is required' },
      isLength: { 
        options: { min: 2, max: 50 },
        errorMessage: 'Name must be between 2 and 50 characters'
      },
      trim: true
    },
    email: {
      notEmpty: { errorMessage: 'Email is required' },
      isEmail: { errorMessage: 'Please provide a valid email' },
      normalizeEmail: true
    },
    password: {
      notEmpty: { errorMessage: 'Password is required' },
      isLength: { 
        options: { min: 6 },
        errorMessage: 'Password must be at least 6 characters long'
      }
    },
    phone: {
      optional: true,
      isMobilePhone: { errorMessage: 'Please provide a valid phone number' }
    }
  },

  // Course validations
  course: {
    title: {
      notEmpty: { errorMessage: 'Course title is required' },
      isLength: { 
        options: { min: 3, max: 100 },
        errorMessage: 'Course title must be between 3 and 100 characters'
      },
      trim: true
    },
    description: {
      notEmpty: { errorMessage: 'Course description is required' },
      isLength: { 
        options: { min: 10, max: 1000 },
        errorMessage: 'Course description must be between 10 and 1000 characters'
      }
    },
    price: {
      optional: true,
      isFloat: { 
        options: { min: 0 },
        errorMessage: 'Price must be a positive number'
      }
    },
    duration: {
      optional: true,
      isInt: { 
        options: { min: 1 },
        errorMessage: 'Duration must be a positive integer'
      }
    }
  },

  // Class validations
  class: {
    title: {
      notEmpty: { errorMessage: 'Class title is required' },
      isLength: { 
        options: { min: 3, max: 100 },
        errorMessage: 'Class title must be between 3 and 100 characters'
      }
    },
    startTime: {
      notEmpty: { errorMessage: 'Start time is required' },
      isISO8601: { errorMessage: 'Start time must be a valid ISO 8601 date' }
    },
    endTime: {
      notEmpty: { errorMessage: 'End time is required' },
      isISO8601: { errorMessage: 'End time must be a valid ISO 8601 date' }
    },
    maxStudents: {
      optional: true,
      isInt: { 
        options: { min: 1 },
        errorMessage: 'Maximum students must be a positive integer'
      }
    }
  },

  // File upload validations
  file: {
    file: {
      optional: true,
      custom: (value, { req }) => {
        if (!req.file && !req.files) {
          throw new Error('File is required');
        }
        return true;
      }
    }
  },

  // Pagination validations
  pagination: {
    page: {
      optional: true,
      isInt: { 
        options: { min: 1 },
        errorMessage: 'Page must be a positive integer'
      },
      toInt: true
    },
    limit: {
      optional: true,
      isInt: { 
        options: { min: 1, max: 100 },
        errorMessage: 'Limit must be between 1 and 100'
      },
      toInt: true
    }
  }
};

// Custom validation functions
const customValidations = {
  // Check if end time is after start time
  endTimeAfterStartTime: (endTimeField) => {
    return (value, { req }) => {
      const startTime = req.body.startTime || req.body[`${endTimeField.replace('End', 'Start')}`];
      if (startTime && new Date(value) <= new Date(startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    };
  },

  // Check if user exists
  userExists: async (value) => {
    const User = require('../models/User');
    const user = await User.findById(value);
    if (!user) {
      throw new Error('User not found');
    }
    return true;
  },

  // Check if course exists
  courseExists: async (value) => {
    const Course = require('../models/Course');
    const course = await Course.findById(value);
    if (!course) {
      throw new Error('Course not found');
    }
    return true;
  },

  // Check if class exists
  classExists: async (value) => {
    const Class = require('../models/Class');
    const classItem = await Class.findById(value);
    if (!classItem) {
      throw new Error('Class not found');
    }
    return true;
  }
};

module.exports = {
  validate,
  commonValidations,
  customValidations
};
