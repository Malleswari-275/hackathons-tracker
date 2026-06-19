const Competition = require('../models/Competition');
const StudentProfile = require('../models/StudentProfile');
const MentorProfile = require('../models/MentorProfile');
const Registration = require('../models/Registration');
const CompetitionAssignment = require('../models/CompetitionAssignment');

// Build a { key: count } map from an aggregation grouped by _id
const toDistribution = (aggResult) => {
  const dist = {};
  aggResult.forEach((item) => {
    if (item._id) dist[item._id] = item.count;
  });
  return dist;
};

const getSuperAdminMetrics = async () => {
  const totalCompetitions = await Competition.countDocuments();
  const approved = await Competition.countDocuments({ status: { $in: ['PUBLISHED', 'LIVE', 'CLOSED'] } });
  const pending = await Competition.countDocuments({ status: 'PENDING' });
  const live = await Competition.countDocuments({ status: 'LIVE' });
  const totalStudents = await StudentProfile.countDocuments();
  const totalAdmins = await MentorProfile.countDocuments();

  const statusAgg = await Competition.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const eventTypeAgg = await Competition.aggregate([
    { $group: { _id: '$eventType', count: { $sum: 1 } } }
  ]);

  const recentCompetitions = await Competition.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title organization status');

  // Registration % global
  const regStats = await Registration.aggregate([
    { $unwind: '$students' },
    { $group: { _id: '$students.status', count: { $sum: 1 } } }
  ]);

  let registeredCount = 0;
  let notRegisteredCount = 0;
  regStats.forEach((stat) => {
    if (stat._id === 'REGISTERED') registeredCount = stat.count;
    if (stat._id === 'NOT_REGISTERED') notRegisteredCount = stat.count;
  });

  const totalResponses = registeredCount + notRegisteredCount;
  const registrationPercentage =
    totalResponses > 0 ? ((registeredCount / totalResponses) * 100).toFixed(2) : 0;

  return {
    totalCompetitions,
    totalStudents,
    totalAdmins,
    activeEvents: live,
    approved,
    pending,
    registrationPercentage: parseFloat(registrationPercentage),
    statusDistribution: toDistribution(statusAgg),
    eventTypeDistribution: toDistribution(eventTypeAgg),
    recentCompetitions
  };
};

const getAdminMetrics = async (adminId) => {
  // Find competitions created by this Admin
  const myCompetitions = await Competition.find({ createdBy: adminId }).select('_id');
  const myCompIds = myCompetitions.map((c) => c._id);

  // Find assignments where they are assigned as mentor
  const mentorAssignments = await CompetitionAssignment.find({ assignedMentors: adminId }).select('competitionId');
  const mentorCompIds = mentorAssignments.map((a) => a.competitionId);

  // Combine unique competition IDs
  const allCompIds = [...new Set([
    ...myCompIds.map((id) => id.toString()),
    ...mentorCompIds.map((id) => id.toString())
  ])];

  const assignedCompetitions = allCompIds.length;

  // Students count assigned
  const assignments = await CompetitionAssignment.find({ competitionId: { $in: allCompIds } }).select('assignedStudents');
  const studentIds = new Set();
  assignments.forEach((a) => {
    a.assignedStudents.forEach((sId) => studentIds.add(sId.toString()));
  });
  const totalStudents = studentIds.size;

  const pendingApprovals = await Competition.countDocuments({ _id: { $in: allCompIds }, status: 'PENDING' });

  // Registration tally for these competitions
  const regs = await Registration.find({ competitionId: { $in: allCompIds } });
  let registeredCount = 0;
  let totalResponses = 0;
  regs.forEach((r) => {
    r.students.forEach((s) => {
      totalResponses++;
      if (s.status === 'REGISTERED') registeredCount++;
    });
  });

  const registrationPercentage =
    totalResponses > 0 ? ((registeredCount / totalResponses) * 100).toFixed(2) : 0;

  const statusAgg = await Competition.aggregate([
    { $match: { createdBy: adminId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const recentCompetitions = await Competition.find({ _id: { $in: allCompIds } })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title organization status');

  return {
    assignedCompetitions,
    totalStudents,
    pendingApprovals,
    totalRegistrations: registeredCount,
    registrationPercentage: parseFloat(registrationPercentage),
    statusDistribution: toDistribution(statusAgg),
    recentCompetitions
  };
};

const getStudentMetrics = async (studentId) => {
  const profile = await StudentProfile.findOne({ userId: studentId });
  if (!profile) {
    throw new Error('Student profile not found');
  }

  // Eligible competitions: published/live AND (no dept filter OR matches dept) AND (no year filter OR matches year)
  const eligibleQuery = {
    status: { $in: ['PUBLISHED', 'LIVE'] },
    $and: [
      { $or: [{ 'eligibility.departments': { $size: 0 } }, { 'eligibility.departments': profile.department }] },
      { $or: [{ 'eligibility.years': { $size: 0 } }, { 'eligibility.years': profile.year }] }
    ]
  };

  const eligibleEvents = await Competition.countDocuments(eligibleQuery);

  const upcomingDeadlines = await Competition.countDocuments({
    ...eligibleQuery,
    'timeline.registrationDeadline': { $gte: new Date() }
  });

  // Registered competitions for this student
  const myRegs = await Registration.find({
    students: { $elemMatch: { studentId, status: 'REGISTERED' } }
  }).select('competitionId');
  const myCompIds = myRegs.map((r) => r.competitionId);

  const registeredEvents = myCompIds.length;
  const completedEvents = await Competition.countDocuments({ _id: { $in: myCompIds }, status: 'CLOSED' });

  return {
    eligibleEvents,
    registeredEvents,
    upcomingDeadlines,
    completedEvents
  };
};

module.exports = {
  getSuperAdminMetrics,
  getAdminMetrics,
  getStudentMetrics
};
