const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team member name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    trim: true,
    maxlength: [50, 'Experience cannot exceed 50 characters']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
    maxlength: [100, 'Specialization cannot exceed 100 characters']
  },
  image: {
    filename: {
      type: String,
      required: [true, 'Team member image filename is required'],
      trim: true
    },
    originalName: {
      type: String,
      required: [true, 'Team member image original name is required'],
      trim: true
    },
    mimetype: {
      type: String,
      required: [true, 'Team member image mimetype is required']
    },
    size: {
      type: Number,
      required: [true, 'Team member image size is required']
    },
    path: {
      type: String,
      required: [true, 'Team member image path is required']
    }
  },
  achievements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Achievement cannot exceed 200 characters']
  }],
  contact: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: [200, 'LinkedIn URL cannot exceed 200 characters']
    }
  },
  color: {
    type: String,
    default: 'from-blue-500 to-purple-600',
    trim: true,
    maxlength: [50, 'Color cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
teamMemberSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
