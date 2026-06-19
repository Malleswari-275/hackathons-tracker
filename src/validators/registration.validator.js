const { body } = require('express-validator');

const updateRegistrationValidator = [
  body('status')
    .isIn(['REGISTERED', 'NOT_REGISTERED'])
    .withMessage('Status must be REGISTERED or NOT_REGISTERED')
];

module.exports = {
  updateRegistrationValidator
};
