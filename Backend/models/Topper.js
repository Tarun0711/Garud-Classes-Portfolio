const mongoose = require('mongoose');

const topperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  exam: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true,
    maxlength: [100, 'Exam name cannot exceed 100 characters']
  },
  rank: {
    type: String,
    required: [true, 'Rank is required'],
    trim: true,
    maxlength: [50, 'Rank cannot exceed 50 characters']
  },
  score: {
    type: String,
    required: [true, 'Score is required'],
    trim: true,
    maxlength: [50, 'Score cannot exceed 50 characters']
  },
  image: {
    filename: {
      type: String,
      required: [true, 'Student image filename is required'],
      trim: true
    },
    originalName: {
      type: String,
      required: [true, 'Student image original name is required'],
      trim: true
    },
    mimetype: {
      type: String,
      required: [true, 'Student image mimetype is required']
    },
    size: {
      type: Number,
      required: [true, 'Student image size is required']
    },
    path: {
      type: String,
      required: [true, 'Student image path is required']
    }
  },
  course: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  achievement: {
    type: String,
    required: [true, 'Achievement is required'],
    trim: true,
    maxlength: [200, 'Achievement cannot exceed 200 characters']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be at least 2000'],
    max: [2030, 'Year cannot exceed 2030']
  },
  category: {
    type: String,
    enum: ['JEE Advanced', 'JEE Main', 'NEET', 'Other'],
    default: 'Other',
    required: [true, 'Category is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
topperSchema.index({ isActive: 1, featured: 1, order: 1, year: -1 });
topperSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Topper', topperSchema);
