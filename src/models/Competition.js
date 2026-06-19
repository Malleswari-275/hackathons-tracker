const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roundId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  title: {
    type: String,
    required: [true, 'Round title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: {
      values: ['UPCOMING', 'LIVE', 'COMPLETED'],
      message: 'Round status must be UPCOMING, LIVE, or COMPLETED'
    },
    default: 'UPCOMING'
  }
});

const prizeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Prize title is required'],
    trim: true
  },
  amount: {
    type: String,
    trim: true
  }
});

const competitionSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator User reference is required']
    },
    title: {
      type: String,
      required: [true, 'Competition title is required'],
      trim: true
    },
    organization: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    eventType: {
      type: String,
      enum: {
        values: [
          'HACKATHON',
          'INTERNSHIP',
          'IDEATHON',
          'FULLTIME',
          'INNOVATION_CHALLENGE',
          'OTHER'
        ],
        message: 'Event type must be one of the allowed options'
      },
      required: [true, 'Event type is required']
    },
    description: {
      type: String,
      trim: true
    },
    registrationUrl: {
      type: String,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    mode: {
      type: String,
      enum: {
        values: ['ONLINE', 'OFFLINE', 'HYBRID'],
        message: 'Mode must be ONLINE, OFFLINE, or HYBRID'
      },
      required: [true, 'Mode is required']
    },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true }
    },
    eligibility: {
      departments: { type: [String], default: [] },
      years: { type: [Number], default: [] },
      skills: { type: [String], default: [] }
    },
    timeline: {
      registrationStart: { type: Date },
      registrationDeadline: { type: Date },
      startDate: { type: Date },
      endDate: { type: Date }
    },
    rounds: {
      type: [roundSchema],
      default: []
    },
    prizes: {
      type: [prizeSchema],
      default: []
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'PUBLISHED', 'REJECTED', 'LIVE', 'CLOSED'],
        message: 'Status must be PENDING, PUBLISHED, REJECTED, LIVE, or CLOSED'
      },
      default: 'PENDING'
    },
    review: {
      required: { type: Boolean, default: true },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      reviewedAt: { type: Date },
      rejectionReason: { type: String, trim: true }
    },
    publishedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'competitions'
  }
);

// Indexes
competitionSchema.index({ createdBy: 1 });
competitionSchema.index({ status: 1 });
competitionSchema.index({ eventType: 1 });
competitionSchema.index({ organization: 1 });
competitionSchema.index({ 'timeline.registrationDeadline': 1 });
competitionSchema.index({ tags: 1 });
competitionSchema.index({ 'eligibility.departments': 1 });
competitionSchema.index({ 'eligibility.years': 1 });

// Combined text index for search query
competitionSchema.index(
  {
    title: 'text',
    organization: 'text',
    tags: 'text'
  },
  {
    weights: {
      title: 10,
      organization: 5,
      tags: 3
    },
    name: 'CompetitionSearchTextIndex'
  }
);

const Competition = mongoose.model('Competition', competitionSchema);

module.exports = Competition;
