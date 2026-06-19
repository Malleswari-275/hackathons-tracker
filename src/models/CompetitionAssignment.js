const mongoose = require('mongoose');

const competitionAssignmentSchema = new mongoose.Schema(
  {
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: [true, 'Competition ID reference is required'],
      unique: true
    },
    assignedMentors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference who made the assignment is required']
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'competition_assignments'
  }
);

// Indexes
competitionAssignmentSchema.index({ competitionId: 1 }, { unique: true });
competitionAssignmentSchema.index({ assignedMentors: 1 });
competitionAssignmentSchema.index({ assignedStudents: 1 });

const CompetitionAssignment = mongoose.model(
  'CompetitionAssignment',
  competitionAssignmentSchema
);

module.exports = CompetitionAssignment;
