const { body } = require('express-validator');

const createAdminValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('employeeId')
    .trim()
    .notEmpty().withMessage('Employee ID is required'),
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),
  body('designation')
    .optional()
    .trim(),
  body('department')
    .optional()
    .trim(),
  body('organization')
    .optional()
    .trim(),
  body('phone')
    .optional()
    .trim()
];

const createStudentValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('rollNumber')
    .trim()
    .notEmpty().withMessage('Roll number is required'),
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),
  body('year')
    .isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  body('section')
    .optional()
    .trim(),
  body('cgpa')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array of strings'),
  body('phone')
    .optional()
    .trim()
];

module.exports = {
  createAdminValidator,
  createStudentValidator
};
