const { body } = require('express-validator');
const mongoose = require('mongoose');

const assignmentValidator = [
  body('competitionId')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Competition ID'),
  body('assignedMentors')
    .isArray().withMessage('assignedMentors must be an array of user IDs')
    .custom((arr) => arr.every((val) => mongoose.Types.ObjectId.isValid(val)))
    .withMessage('One or more Mentor IDs are invalid'),
  body('assignedStudents')
    .isArray().withMessage('assignedStudents must be an array of user IDs')
    .custom((arr) => arr.every((val) => mongoose.Types.ObjectId.isValid(val)))
    .withMessage('One or more Student IDs are invalid')
];

module.exports = {
  assignmentValidator
};
