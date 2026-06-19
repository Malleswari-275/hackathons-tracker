const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      enum: {
        values: ['SUPER_ADMIN', 'ADMIN', 'STUDENT'],
        message: 'Role must be SUPER_ADMIN, ADMIN, or STUDENT'
      },
      required: [true, 'Role is required']
    },
    status: {
      type: String,
      enum: {
        values: ['INVITED', 'ACTIVE', 'BLOCKED'],
        message: 'Status must be INVITED, ACTIVE, or BLOCKED'
      },
      default: 'INVITED'
    },
    forcePasswordChange: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    passwordChangedAt: {
      type: Date
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdBy: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
