const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient User reference is required']
    },
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      default: null
    },
    type: {
      type: String,
      enum: {
        values: [
          'EVENT_ASSIGNED',
          'EVENT_APPROVED',
          'EVENT_REJECTED',
          'ELIGIBLE_EVENT',
          'DEADLINE_REMINDER',
          'EVENT_STARTS',
          'GENERAL'
        ],
        message: 'Notification type must be a valid enum value'
      },
      required: [true, 'Notification type is required']
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    channels: {
      type: [String],
      enum: {
        values: ['portal', 'email'],
        message: 'Channels can contain portal and/or email'
      },
      default: ['portal']
    },
    delivery: {
      emailSent: {
        type: Boolean,
        default: false
      },
      emailSentAt: {
        type: Date
      }
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'notifications'
  }
);

// Indexes
notificationSchema.index({ recipientId: 1 });
notificationSchema.index({ competitionId: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
