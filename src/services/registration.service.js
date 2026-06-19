const Registration = require('../models/Registration');
const Competition = require('../models/Competition');

const updateRegistrationStatus = async (competitionId, studentId, status) => {
  const reg = await Registration.findOne({ competitionId });
  if (!reg) {
    throw new Error('Registration record not found for this competition. Make sure students are assigned first.');
  }

  const studentEntry = reg.students.find((s) => s.studentId.toString() === studentId.toString());
  if (!studentEntry) {
    throw new Error('Access denied: You are not assigned to this competition');
  }

  studentEntry.status = status;
  studentEntry.updatedAt = new Date();

  await reg.save();
  return reg;
};

const getRegistrationsByCompetitionId = async (competitionId) => {
  const reg = await Registration.findOne({ competitionId })
    .populate('students.studentId', 'email');
  if (!reg) {
    throw new Error('Registration list not found');
  }
  return reg;
};

const getRegistrationAnalytics = async () => {
  const stats = await Registration.aggregate([
    { $unwind: '$students' },
    {
      $group: {
        _id: '$students.status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = { REGISTERED: 0, NOT_REGISTERED: 0 };
  stats.forEach((item) => {
    if (result[item._id] !== undefined) {
      result[item._id] = item.count;
    }
  });

  const total = result.REGISTERED + result.NOT_REGISTERED;
  const registrationPercentage = total > 0 ? ((result.REGISTERED / total) * 100).toFixed(2) : 0;

  return {
    ...result,
    total,
    registrationPercentage: parseFloat(registrationPercentage)
  };
};

module.exports = {
  updateRegistrationStatus,
  getRegistrationsByCompetitionId,
  getRegistrationAnalytics
};
