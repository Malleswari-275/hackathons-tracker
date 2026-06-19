const mongoose = require('mongoose');

const superAdminProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true
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
    profileImage: {
      type: String,
      trim: true
    },
    settings: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      portalNotifications: {
        type: Boolean,
        default: true
      },
      darkMode: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true,
    collection: 'super_admin_profiles'
  }
);

// Indexes
superAdminProfileSchema.index({ userId: 1 }, { unique: true });

const SuperAdminProfile = mongoose.model('SuperAdminProfile', superAdminProfileSchema);

module.exports = SuperAdminProfile;
