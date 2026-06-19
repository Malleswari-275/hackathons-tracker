const CompetitionAssignment = require('../models/CompetitionAssignment');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const { triggerNotification } = require('./notification.service');

const assignCompetition = async (data, assignedByUserId) => {
  const { competitionId, assignedMentors, assignedStudents } = data;

  const comp = await Competition.findById(competitionId);
  if (!comp) {
    throw new Error('Competition not found');
  }

  let assignment = await CompetitionAssignment.findOne({ competitionId });

  if (assignment) {
    // Update existing
    assignment.assignedMentors = assignedMentors;
    assignment.assignedStudents = assignedStudents;
    assignment.assignedBy = assignedByUserId;
    assignment.assignedAt = new Date();
    await assignment.save();
  } else {
    // Create new
    assignment = await CompetitionAssignment.create({
      competitionId,
      assignedMentors,
      assignedStudents,
      assignedBy: assignedByUserId,
      assignedAt: new Date()
    });
  }

  // Synchronize student pool in Registrations collection
  let reg = await Registration.findOne({ competitionId });
  if (!reg) {
    reg = await Registration.create({
      competitionId,
      students: []
    });
  }

  // Merge students to keep existing responses, but add new ones
  const existingStudentIds = reg.students.map((s) => s.studentId.toString());
  assignedStudents.forEach((studentId) => {
    if (!existingStudentIds.includes(studentId.toString())) {
      reg.students.push({
        studentId,
        status: 'REGISTERED', // Default status from schema rules
        updatedAt: new Date()
      });
    }
  });

  // Remove students not in the assignment anymore
  reg.students = reg.students.filter((s) =>
    assignedStudents.some((id) => id.toString() === s.studentId.toString())
  );
  await reg.save();

  // Send assignment notifications
  if (assignedMentors && assignedMentors.length > 0) {
    await triggerNotification('EVENT_ASSIGNED', {
      competitionId,
      title: comp.title,
      message: `You have been assigned as a Mentor for "${comp.title}"`,
      roleName: 'MENTOR',
      recipientIds: assignedMentors
    });
  }

  if (assignedStudents && assignedStudents.length > 0) {
    await triggerNotification('EVENT_ASSIGNED', {
      competitionId,
      title: comp.title,
      message: `You have been assigned to participate in "${comp.title}"`,
      roleName: 'STUDENT',
      recipientIds: assignedStudents
    });
  }

  return assignment;
};

const getAssignmentsByCompetitionId = async (competitionId) => {
  const assignment = await CompetitionAssignment.findOne({ competitionId })
    .populate('assignedMentors', 'email')
    .populate('assignedStudents', 'email')
    .populate('assignedBy', 'email');
  return assignment;
};

const deleteAssignment = async (assignmentId) => {
  const assignment = await CompetitionAssignment.findByIdAndDelete(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }
  return { success: true };
};

module.exports = {
  assignCompetition,
  getAssignmentsByCompetitionId,
  deleteAssignment
};
