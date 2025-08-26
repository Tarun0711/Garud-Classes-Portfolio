const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Class title is required'],
    trim: true,
    maxlength: [100, 'Class title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Class description is required'],
    maxlength: [500, 'Class description cannot be more than 500 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  maxStudents: {
    type: Number,
    default: null,
    min: [1, 'Maximum students must be at least 1']
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: [0, 'Current students cannot be negative']
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  meetingLink: {
    type: String,
    trim: true
  },
  meetingPassword: {
    type: String,
    trim: true
  },
  meetingPlatform: {
    type: String,
    enum: ['zoom', 'google-meet', 'teams', 'skype', 'other'],
    default: 'zoom'
  },
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
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  recording: {
    url: String,
    password: String,
    availableUntil: Date,
    uploadedAt: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  homework: {
    title: String,
    description: String,
    dueDate: Date,
    maxPoints: Number
  },
  attendance: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'absent'
    },
    joinedAt: Date,
    leftAt: Date,
    notes: String
  }],
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'attended', 'completed', 'dropped'],
      default: 'enrolled'
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'P', 'NP'],
      default: null
    },
    feedback: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    endDate: Date,
    maxOccurrences: Number
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      required: true
    },
    timeBeforeClass: {
      type: Number, // in minutes
      required: true
    },
    isEnabled: {
      type: Boolean,
      default: true
    }
  }],
  settings: {
    allowLateJoin: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoRecord: {
      type: Boolean,
      default: false
    },
    chatEnabled: {
      type: Boolean,
      default: true
    },
    screenShareEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for class status
classSchema.virtual('isFull').get(function() {
  if (this.maxStudents === null) return false;
  return this.currentStudents >= this.maxStudents;
});

// Virtual for enrollment status
classSchema.virtual('canEnroll').get(function() {
  if (this.status !== 'scheduled') return false;
  if (this.isFull) return false;
  return true;
});

// Virtual for time until class starts
classSchema.virtual('timeUntilStart').get(function() {
  const now = new Date();
  const timeDiff = this.startTime.getTime() - now.getTime();
  
  if (timeDiff <= 0) return 'Started';
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days} day${days === 1 ? '' : 's'}`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'}`;
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
});

// Virtual for class progress
classSchema.virtual('progress').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'cancelled' || this.status === 'postponed') return 0;
  
  const now = new Date();
  const totalDuration = this.endTime.getTime() - this.startTime.getTime();
  const elapsed = now.getTime() - this.startTime.getTime();
  
  if (elapsed <= 0) return 0;
  if (elapsed >= totalDuration) return 100;
  
  return Math.round((elapsed / totalDuration) * 100);
});

// Indexes for better query performance
classSchema.index({ course: 1 });
classSchema.index({ instructor: 1 });
classSchema.index({ startTime: 1 });
classSchema.index({ status: 1 });
classSchema.index({ 'students.student': 1 });
classSchema.index({ isRecurring: 1 });

// Pre-save middleware to calculate duration
classSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const durationMs = this.endTime.getTime() - this.startTime.getTime();
    this.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Method to add student to class
classSchema.methods.addStudent = function(studentId) {
  // Check if student is already enrolled
  const existingStudent = this.students.find(s => 
    s.student.toString() === studentId.toString()
  );
  
  if (existingStudent) {
    throw new Error('Student is already enrolled in this class');
  }
  
  // Check if class is full
  if (this.isFull) {
    throw new Error('Class is full');
  }
  
  // Add student
  this.students.push({ student: studentId });
  this.currentStudents += 1;
  
  return this.save();
};

// Method to remove student from class
classSchema.methods.removeStudent = function(studentId) {
  const studentIndex = this.students.findIndex(s => 
    s.student.toString() === studentId.toString()
  );
  
  if (studentIndex === -1) {
    throw new Error('Student is not enrolled in this class');
  }
  
  // Remove student
  this.students.splice(studentIndex, 1);
  this.currentStudents = Math.max(0, this.currentStudents - 1);
  
  return this.save();
};

// Method to mark attendance
classSchema.methods.markAttendance = function(studentId, status, notes = '') {
  const attendanceIndex = this.attendance.findIndex(a => 
    a.student.toString() === studentId.toString()
  );
  
  if (attendanceIndex === -1) {
    // Add new attendance record
    this.attendance.push({
      student: studentId,
      status,
      notes,
      joinedAt: status === 'present' ? new Date() : null
    });
  } else {
    // Update existing attendance record
    this.attendance[attendanceIndex].status = status;
    this.attendance[attendanceIndex].notes = notes;
    
    if (status === 'present' && !this.attendance[attendanceIndex].joinedAt) {
      this.attendance[attendanceIndex].joinedAt = new Date();
    }
  }
  
  return this.save();
};

// Method to update class status
classSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  if (newStatus === 'in-progress') {
    this.attendance.forEach(record => {
      if (record.status === 'enrolled') {
        record.status = 'absent';
      }
    });
  }
  
  return this.save();
};

// Static method to find upcoming classes
classSchema.statics.findUpcoming = function() {
  const now = new Date();
  return this.find({
    startTime: { $gt: now },
    status: 'scheduled'
  }).sort({ startTime: 1 });
};

// Static method to find classes by instructor
classSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructor: instructorId });
};

// Static method to find classes by course
classSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId });
};

// Static method to find classes for student
classSchema.statics.findByStudent = function(studentId) {
  return this.find({
    'students.student': studentId
  });
};

module.exports = mongoose.model('Class', classSchema);
