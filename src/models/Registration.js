const mongoose = require('mongoose');

const studentResponseSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID reference is required']
  },
  status: {
    type: String,
    enum: {
      values: ['REGISTERED', 'NOT_REGISTERED'],
      message: 'Status must be REGISTERED or NOT_REGISTERED'
    },
    default: 'REGISTERED'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const registrationSchema = new mongoose.Schema(
  {
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: [true, 'Competition ID reference is required'],
      unique: true
    },
    students: {
      type: [studentResponseSchema],
      default: []
    }
  },
  {
    timestamps: true,
    collection: 'registrations'
  }
);

// Indexes
registrationSchema.index({ competitionId: 1 }, { unique: true });
registrationSchema.index({ 'students.studentId': 1 });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
