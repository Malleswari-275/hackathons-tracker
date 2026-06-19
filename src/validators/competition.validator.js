const { body } = require('express-validator');

const competitionValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Competition title is required'),
  body('organization')
    .trim()
    .notEmpty().withMessage('Organization is required'),
  body('eventType')
    .isIn(['HACKATHON', 'INTERNSHIP', 'IDEATHON', 'FULLTIME', 'INNOVATION_CHALLENGE', 'OTHER'])
    .withMessage('Event type is invalid'),
  body('mode')
    .isIn(['ONLINE', 'OFFLINE', 'HYBRID'])
    .withMessage('Mode must be ONLINE, OFFLINE, or HYBRID'),
  body('registrationUrl')
    .optional()
    .trim()
    .isURL().withMessage('Registration URL must be a valid URL'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array of strings'),
  body('location')
    .optional()
    .isObject().withMessage('Location must be an object'),
  body('eligibility')
    .optional()
    .isObject().withMessage('Eligibility requirements must be an object'),
  body('eligibility.departments')
    .optional()
    .isArray().withMessage('Eligible departments must be an array of strings'),
  body('eligibility.years')
    .optional()
    .isArray().withMessage('Eligible years must be an array of integers'),
  body('eligibility.skills')
    .optional()
    .isArray().withMessage('Eligible skills must be an array of strings'),
  body('timeline')
    .optional()
    .isObject().withMessage('Timeline details must be an object'),
  body('timeline.registrationStart')
    .optional()
    .isISO8601().toDate().withMessage('registrationStart must be a valid date'),
  body('timeline.registrationDeadline')
    .optional()
    .isISO8601().toDate().withMessage('registrationDeadline must be a valid date'),
  body('timeline.startDate')
    .optional()
    .isISO8601().toDate().withMessage('startDate must be a valid date'),
  body('timeline.endDate')
    .optional()
    .isISO8601().toDate().withMessage('endDate must be a valid date'),
  body('rounds')
    .optional()
    .isArray().withMessage('Rounds must be an array'),
  body('rounds.*.title')
    .optional()
    .trim()
    .notEmpty().withMessage('Round title is required'),
  body('prizes')
    .optional()
    .isArray().withMessage('Prizes must be an array'),
  body('prizes.*.title')
    .optional()
    .trim()
    .notEmpty().withMessage('Prize title is required'),
  body('prizes.*.amount')
    .optional()
    .isNumeric().withMessage('Prize amount must be a number')
];

module.exports = {
  competitionValidator
};
