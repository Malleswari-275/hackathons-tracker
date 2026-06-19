const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    year: {
      type: Number,
      required: [true, 'Year of study is required'],
      min: [1, 'Year must be at least 1'],
      max: [5, 'Year must be at most 5']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    section: {
      type: String,
      trim: true
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0']
    },
    skills: {
      type: [String],
      default: []
    },
    phone: {
      type: String,
      trim: true
    },
    profileImage: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      default: 'ACTIVE'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator User reference is required']
    }
  },
  {
    timestamps: true,
    collection: 'student_profiles'
  }
);

// Indexes
studentProfileSchema.index({ userId: 1 }, { unique: true });
studentProfileSchema.index({ rollNumber: 1 }, { unique: true });
studentProfileSchema.index({ department: 1, year: 1 });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;
