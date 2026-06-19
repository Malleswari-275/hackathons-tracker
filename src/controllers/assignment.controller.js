const assignmentService = require('../services/assignment.service');
const { sendSuccess } = require('../utils/helpers');

const assign = async (req, res, next) => {
  try {
    const assignment = await assignmentService.assignCompetition(req.body, req.user._id);
    return sendSuccess(res, 'Competition assignments updated successfully', assignment);
  } catch (error) {
    next(error);
  }
};

const getAssignments = async (req, res, next) => {
  try {
    const assignment = await assignmentService.getAssignmentsByCompetitionId(req.params.competitionId);
    return sendSuccess(res, 'Assignments loaded successfully', assignment);
  } catch (error) {
    next(error);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    await assignmentService.deleteAssignment(req.params.id);
    return sendSuccess(res, 'Assignment record deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assign,
  getAssignments,
  deleteAssignment
};
