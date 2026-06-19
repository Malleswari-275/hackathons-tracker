const registrationService = require('../services/registration.service');
const { sendSuccess } = require('../utils/helpers');

const updateRegistration = async (req, res, next) => {
  try {
    const { status } = req.body;
    // Enforce student rules: students can only update their own response
    const reg = await registrationService.updateRegistrationStatus(
      req.params.competitionId,
      req.user._id,
      status
    );
    return sendSuccess(res, `Your registration response is updated to ${status}`, reg);
  } catch (error) {
    next(error);
  }
};

const getRegistrations = async (req, res, next) => {
  try {
    const reg = await registrationService.getRegistrationsByCompetitionId(req.params.competitionId);
    return sendSuccess(res, 'Competition student responses loaded', reg);
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const stats = await registrationService.getRegistrationAnalytics();
    return sendSuccess(res, 'Registration analytics metrics calculated', stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateRegistration,
  getRegistrations,
  getAnalytics
};
