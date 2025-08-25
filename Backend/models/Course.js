const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Course description cannot be more than 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: [
      'Neet', 'Jee', 'Jee Mains', 'Jee Advanced', 'dropper', 'Foundation', 'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  },
  duration: {
    type: Number, // in hours
    min: [0, 'Duration cannot be negative']
  },
  lessons: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    duration: Number, // in minutes
    order: Number,
    isPublished: {
      type: Boolean,
      default: false
    }
  }],
  materials: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['document', 'video', 'audio', 'link', 'other'],
      required: true
    },
    fileUrl: String,
    externalUrl: String,
    description: String,
    size: Number, // in bytes
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  thumbnail: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  maxEnrollment: {
    type: Number,
    default: null
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  schedule: {
    startDate: Date,
    endDate: Date,
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timeSlots: [{
      startTime: String, // HH:MM format
      endTime: String,   // HH:MM format
      timezone: {
        type: String,
        default: 'UTC'
      }
    }]
  },
  certificate: {
    isAvailable: {
      type: Boolean,
      default: false
    },
    requirements: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'suspended'],
    default: 'draft'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for course duration in readable format
courseSchema.virtual('durationFormatted').get(function() {
  if (!this.duration) return 'Not specified';
  
  const hours = Math.floor(this.duration);
  const minutes = Math.round((this.duration - hours) * 60);
  
  if (hours === 0) {
    return `${minutes} minutes`;
  } else if (minutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  } else {
    return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minutes`;
  }
});

// Virtual for price in readable format
courseSchema.virtual('priceFormatted').get(function() {
  if (this.price === 0) return 'Free';
  return `${this.currency} ${this.price.toFixed(2)}`;
});

// Virtual for enrollment status
courseSchema.virtual('isEnrollmentOpen').get(function() {
  if (!this.isPublished || this.status !== 'published') return false;
  if (this.maxEnrollment === null) return true;
  return this.enrollmentCount < this.maxEnrollment;
});

// Indexes for better query performance
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1, status: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ rating: 1 });

// Pre-save middleware to generate slug
courseSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    return next();
  }
  
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
    
  next();
});

// Method to calculate average rating
courseSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;
};

// Method to add review
courseSchema.methods.addReview = function(userId, rating, comment) {
  // Remove existing review by same user
  this.reviews = this.reviews.filter(review => 
    review.user.toString() !== userId.toString()
  );
  
  // Add new review
  this.reviews.push({ user: userId, rating, comment });
  
  // Recalculate average rating
  this.calculateAverageRating();
  
  return this.save();
};

// Method to increment enrollment count
courseSchema.methods.incrementEnrollment = function() {
  this.enrollmentCount += 1;
  return this.save();
};

// Method to decrement enrollment count
courseSchema.methods.decrementEnrollment = function() {
  if (this.enrollmentCount > 0) {
    this.enrollmentCount -= 1;
    return this.save();
  }
  return this;
};

// Static method to find published courses
courseSchema.statics.findPublished = function() {
  return this.find({ 
    isPublished: true, 
    status: 'published' 
  });
};

// Static method to find courses by category
courseSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    isPublished: true, 
    status: 'published' 
  });
};

// Static method to find courses by instructor
courseSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructor: instructorId });
};

module.exports = mongoose.model('Course', courseSchema);
