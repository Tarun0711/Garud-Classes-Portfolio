const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Announcement message is required'],
    trim: true,
    maxlength: [300, 'Announcement cannot exceed 300 characters']
  },
  emoji: {
    type: String,
    default: '📢',
    trim: true,
    maxlength: [10, 'Emoji cannot exceed 10 characters']
  },
  linkUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  startAt: {
    type: Date,
    default: null
  },
  endAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

announcementSchema.index({ isActive: 1, priority: 1, createdAt: -1 });

announcementSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    $and: [
      { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
      { $or: [{ endAt: null }, { endAt: { $gte: now } }] }
    ]
  }).sort({ priority: -1, createdAt: -1 });
};

module.exports = mongoose.model('Announcement', announcementSchema);


