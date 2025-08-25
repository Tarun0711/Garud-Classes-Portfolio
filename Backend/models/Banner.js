const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot exceed 200 characters']
  },
  image: {
    filename: {
      type: String,
      required: [true, 'Banner image filename is required'],
      trim: true
    },
    originalName: {
      type: String,
      required: [true, 'Banner image original name is required'],
      trim: true
    },
    mimetype: {
      type: String,
      required: [true, 'Banner image mimetype is required']
    },
    size: {
      type: Number,
      required: [true, 'Banner image size is required']
    },
    path: {
      type: String,
      required: [true, 'Banner image path is required']
    }
  },
  linkUrl: {
    type: String,
    trim: true
  },
  tag: {
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
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
bannerSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
