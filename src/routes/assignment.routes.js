const express = require('express');
const assignmentController = require('../controllers/assignment.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationHandler = require('../middleware/validationHandler');
const { assignmentValidator } = require('../validators/assignment.validator');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), assignmentValidator, validationHandler, assignmentController.assign);
router.get('/:competitionId', assignmentController.getAssignments);
router.delete('/:id', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), assignmentController.deleteAssignment);

module.exports = router;
