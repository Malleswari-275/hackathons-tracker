const { body } = require('express-validator');

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty'),
  body('phone')
    .optional()
    .trim(),
  body('designation')
    .optional()
    .trim(),
  body('department')
    .optional()
    .trim(),
  body('organization')
    .optional()
    .trim(),
  body('section')
    .optional()
    .trim(),
  body('cgpa')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array of strings'),
  body('settings')
    .optional()
    .isObject().withMessage('Settings must be an object'),
  body('settings.emailNotifications')
    .optional()
    .isBoolean().withMessage('emailNotifications must be a boolean'),
  body('settings.portalNotifications')
    .optional()
    .isBoolean().withMessage('portalNotifications must be a boolean'),
  body('settings.darkMode')
    .optional()
    .isBoolean().withMessage('darkMode must be a boolean')
];

module.exports = {
  updateProfileValidator
};
