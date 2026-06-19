const express = require('express');
const competitionController = require('../controllers/competition.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationHandler = require('../middleware/validationHandler');
const { competitionValidator } = require('../validators/competition.validator');

const router = express.Router();

router.use(authMiddleware);

// Competition CRUD
router.post('/', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), competitionValidator, validationHandler, competitionController.createCompetition);
router.put('/:id', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), competitionValidator, validationHandler, competitionController.updateCompetition);
router.delete('/:id', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), competitionController.deleteCompetition);
router.get('/', competitionController.getAllCompetitions);
router.get('/:id', competitionController.getCompetitionById);

// Approval Module (Only SUPER_ADMIN)
router.patch('/:id/approve', roleMiddleware(['SUPER_ADMIN']), competitionController.approveCompetition);
router.patch('/:id/reject', roleMiddleware(['SUPER_ADMIN']), competitionController.rejectCompetition);
router.patch('/:id/publish', roleMiddleware(['SUPER_ADMIN']), competitionController.publishCompetition);

module.exports = router;
