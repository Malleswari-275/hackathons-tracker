const competitionService = require('../services/competition.service');
const Competition = require('../models/Competition');
const { triggerNotification } = require('../services/notification.service');
const { sendSuccess } = require('../utils/helpers');

const createCompetition = async (req, res, next) => {
  try {
    const comp = await competitionService.createCompetition(req.body, req.user);
    return sendSuccess(res, 'Competition created successfully', comp, 201);
  } catch (error) {
    next(error);
  }
};

const updateCompetition = async (req, res, next) => {
  try {
    const comp = await competitionService.updateCompetition(req.params.id, req.body, req.user);
    return sendSuccess(res, 'Competition updated successfully', comp);
  } catch (error) {
    next(error);
  }
};

const deleteCompetition = async (req, res, next) => {
  try {
    await competitionService.deleteCompetition(req.params.id, req.user);
    return sendSuccess(res, 'Competition deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getCompetitionById = async (req, res, next) => {
  try {
    const comp = await competitionService.getCompetitionById(req.params.id);
    return sendSuccess(res, 'Competition retrieved successfully', comp);
  } catch (error) {
    next(error);
  }
};

const getAllCompetitions = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      eventType: req.query.eventType,
      status: req.query.status,
      mode: req.query.mode,
      organization: req.query.organization,
      tags: req.query.tags,
      deadlineBefore: req.query.deadlineBefore,
      deadlineAfter: req.query.deadlineAfter,
      department: req.query.department,
      year: req.query.year
    };

    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const result = await competitionService.queryCompetitions(filters, options);
    return sendSuccess(res, 'Competitions query executed successfully', result);
  } catch (error) {
    next(error);
  }
};

// Approval Module endpoints (Only SUPER_ADMIN)
const approveCompetition = async (req, res, next) => {
  try {
    const comp = await Competition.findById(req.params.id);
    if (!comp) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    comp.status = 'PUBLISHED';
    comp.review.required = false;
    comp.review.reviewedBy = req.user._id;
    comp.review.reviewedAt = new Date();
    comp.publishedAt = new Date();
    await comp.save();

    // Trigger Notification for approval
    await triggerNotification('EVENT_APPROVED', {
      competitionId: comp._id,
      recipientId: comp.createdBy,
      title: comp.title,
      organization: comp.organization,
      message: `Your competition "${comp.title}" has been APPROVED and published!`
    });

    // Trigger Notification for eligible students
    await triggerNotification('ELIGIBLE_EVENT', {
      competitionId: comp._id,
      eligibility: comp.eligibility,
      title: `New Event: ${comp.title}`,
      message: `A new ${comp.eventType} "${comp.title}" is published. Check if you are eligible!`
    });

    return sendSuccess(res, 'Competition approved and published', comp);
  } catch (error) {
    next(error);
  }
};

const rejectCompetition = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const comp = await Competition.findById(req.params.id);
    if (!comp) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    comp.status = 'REJECTED';
    comp.review.required = false;
    comp.review.reviewedBy = req.user._id;
    comp.review.reviewedAt = new Date();
    comp.review.rejectionReason = rejectionReason;
    await comp.save();

    // Trigger Notification for rejection
    await triggerNotification('EVENT_REJECTED', {
      competitionId: comp._id,
      recipientId: comp.createdBy,
      title: comp.title,
      organization: comp.organization,
      reason: rejectionReason,
      message: `Your competition "${comp.title}" has been REJECTED.`
    });

    return sendSuccess(res, 'Competition review updated: REJECTED', comp);
  } catch (error) {
    next(error);
  }
};

const publishCompetition = async (req, res, next) => {
  try {
    const comp = await Competition.findById(req.params.id);
    if (!comp) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    comp.status = 'PUBLISHED';
    comp.review.required = false;
    comp.publishedAt = new Date();
    await comp.save();

    // Alert students
    await triggerNotification('ELIGIBLE_EVENT', {
      competitionId: comp._id,
      eligibility: comp.eligibility,
      title: comp.title,
      message: `New Event: ${comp.title}`
    });

    return sendSuccess(res, 'Competition published successfully', comp);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompetition,
  updateCompetition,
  deleteCompetition,
  getCompetitionById,
  getAllCompetitions,
  approveCompetition,
  rejectCompetition,
  publishCompetition
};
