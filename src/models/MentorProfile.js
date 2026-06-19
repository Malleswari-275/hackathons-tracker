const mongoose = require('mongoose');

const mentorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
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
    designation: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    organization: {
      type: String,
      trim: true
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
    }
  },
  {
    timestamps: true,
    collection: 'mentor_profiles'
  }
);

// Indexes
mentorProfileSchema.index({ userId: 1 }, { unique: true });
mentorProfileSchema.index({ employeeId: 1 });

const MentorProfile = mongoose.model('MentorProfile', mentorProfileSchema);

module.exports = MentorProfile;
