const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Blog slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
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
    ]
  },
  tags: [{
    type: String,
    trim: true,
    // maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  featuredImage: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  readTime: {
    type: Number,
    default: 5,
    min: [1, 'Read time must be at least 1 minute']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  metaTitle: {
    type: String,
    trim: true,
    // maxlength: [160, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    // maxlength: [360, 'Meta description cannot exceed 160 characters']
  },
  publishedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ isFeatured: 1, publishedAt: -1 });
blogSchema.index({ category: 1, isPublished: 1 });
blogSchema.index({ tags: 1, isPublished: 1 });
blogSchema.index({ author: 1, isPublished: 1 });

// Virtual for image URL
blogSchema.virtual('imageUrl').get(function() {
  if (this.featuredImage && this.featuredImage.filename) {
    return `/uploads/images/${this.featuredImage.filename}`;
  }
  return null;
});

// Ensure virtual fields are serialized
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

// Static method to find published blogs
blogSchema.statics.findPublished = function() {
  return this.find({
    isPublished: true,
    publishedAt: { $lte: new Date() }
  }).sort({ publishedAt: -1 });
};

// Static method to find featured blogs
blogSchema.statics.findFeatured = function() {
  return this.find({
    isPublished: true,
    isFeatured: true,
    publishedAt: { $lte: new Date() }
  }).sort({ publishedAt: -1 });
};

// Static method to find blogs by category
blogSchema.statics.findByCategory = function(category) {
  return this.find({
    isPublished: true,
    category: category,
    publishedAt: { $lte: new Date() }
  }).sort({ publishedAt: -1 });
};

// Static method to search blogs
blogSchema.statics.search = function(query) {
  return this.find({
    isPublished: true,
    publishedAt: { $lte: new Date() },
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { excerpt: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  }).sort({ publishedAt: -1 });
};

// Pre-save middleware to generate slug if not provided
blogSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Set publishedAt when publishing
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Method to increment view count
blogSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

module.exports = mongoose.model('Blog', blogSchema);
