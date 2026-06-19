const Competition = require('../models/Competition');
const { triggerNotification } = require('./notification.service');

const createCompetition = async (compData, creator) => {
  const isSuperAdmin = creator.role === 'SUPER_ADMIN';

  const newComp = new Competition({
    ...compData,
    createdBy: creator._id,
    status: isSuperAdmin ? 'PUBLISHED' : 'PENDING',
    review: {
      required: !isSuperAdmin,
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null
    },
    publishedAt: isSuperAdmin ? new Date() : null
  });

  await newComp.save();

  // If SUPER_ADMIN published directly, alert eligible students
  if (isSuperAdmin) {
    await triggerNotification('ELIGIBLE_EVENT', {
      competitionId: newComp._id,
      eligibility: newComp.eligibility,
      title: `New Event: ${newComp.title}`,
      message: `A new ${newComp.eventType} "${newComp.title}" has been published. Check if you are eligible!`
    });
  }

  return newComp;
};

const updateCompetition = async (compId, compData, updater) => {
  const comp = await Competition.findById(compId);
  if (!comp) {
    throw new Error('Competition not found');
  }

  // Author check: Admins can only edit their own competitions
  if (updater.role === 'ADMIN' && comp.createdBy.toString() !== updater._id.toString()) {
    throw new Error('Forbidden: You are not allowed to edit this competition');
  }

  const fields = [
    'title',
    'organization',
    'eventType',
    'description',
    'registrationUrl',
    'tags',
    'mode',
    'location',
    'eligibility',
    'timeline',
    'rounds',
    'prizes'
  ];

  fields.forEach((field) => {
    if (compData[field] !== undefined) {
      comp[field] = compData[field];
    }
  });

  // If ADMIN updates, status reverts back to PENDING for Super Admin review
  if (updater.role === 'ADMIN' && comp.status !== 'PENDING') {
    comp.status = 'PENDING';
    comp.review.required = true;
    comp.review.reviewedBy = null;
    comp.review.reviewedAt = null;
  }

  await comp.save();
  return comp;
};

const deleteCompetition = async (compId, user) => {
  const comp = await Competition.findById(compId);
  if (!comp) {
    throw new Error('Competition not found');
  }

  if (user.role === 'ADMIN' && comp.createdBy.toString() !== user._id.toString()) {
    throw new Error('Forbidden: You cannot delete this competition');
  }

  await Competition.findByIdAndDelete(compId);
  return { success: true };
};

const getCompetitionById = async (compId) => {
  const comp = await Competition.findById(compId).populate('createdBy', 'email role');
  if (!comp) {
    throw new Error('Competition not found');
  }
  return comp;
};

const queryCompetitions = async (filters = {}, options = {}) => {
  const query = {};

  // Text search
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  // Exact matches
  if (filters.eventType) query.eventType = filters.eventType;
  if (filters.status) query.status = filters.status;
  if (filters.mode) query.mode = filters.mode;
  if (filters.organization) query.organization = filters.organization;

  // Tag list match
  if (filters.tags) {
    const tagsArr = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    query.tags = { $in: tagsArr.map((t) => t.toLowerCase()) };
  }

  // Registration Deadline filter
  if (filters.deadlineBefore) {
    query['timeline.registrationDeadline'] = { $lte: new Date(filters.deadlineBefore) };
  }
  if (filters.deadlineAfter) {
    query['timeline.registrationDeadline'] = {
      ...query['timeline.registrationDeadline'],
      $gte: new Date(filters.deadlineAfter)
    };
  }

  // Academic eligibility filter (for student search integration)
  if (filters.department) {
    query['eligibility.departments'] = filters.department;
  }
  if (filters.year) {
    query['eligibility.years'] = parseInt(filters.year, 10);
  }

  // Pagination options
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.max(1, parseInt(options.limit, 10) || 10);
  const skip = (page - 1) * limit;

  // Sorting logic
  let sort = { createdAt: -1 };
  if (filters.search) {
    sort = { score: { $meta: 'textScore' } };
  } else if (options.sortBy) {
    const order = options.sortOrder === 'asc' ? 1 : -1;
    sort = { [options.sortBy]: order };
  }

  const results = await Competition.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'email role');

  const total = await Competition.countDocuments(query);

  return {
    results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  createCompetition,
  updateCompetition,
  deleteCompetition,
  getCompetitionById,
  queryCompetitions
};
