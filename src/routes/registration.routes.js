const express = require('express');
const registrationController = require('../controllers/registration.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationHandler = require('../middleware/validationHandler');
const { updateRegistrationValidator } = require('../validators/registration.validator');

const router = express.Router();

router.use(authMiddleware);

// Analytics must be matching before :competitionId parameter to avoid routing clash
router.get('/analytics', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), registrationController.getAnalytics);

router.patch('/:competitionId', roleMiddleware(['STUDENT']), updateRegistrationValidator, validationHandler, registrationController.updateRegistration);
router.get('/:competitionId', registrationController.getRegistrations);

module.exports = router;
