const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationHandler = require('../middleware/validationHandler');
const {
  createAdminValidator,
  createStudentValidator
} = require('../validators/user.validator');

const router = express.Router();

// Apply auth for all subroutes
router.use(authMiddleware);

// Admin user lifecycle management (Only SUPER_ADMIN)
router.post('/admins', roleMiddleware(['SUPER_ADMIN']), createAdminValidator, validationHandler, userController.createAdmin);
router.get('/admins', roleMiddleware(['SUPER_ADMIN']), userController.listAdmins);
router.put('/admins/:id', roleMiddleware(['SUPER_ADMIN']), userController.editAdmin);
router.patch('/admins/:id/toggle', roleMiddleware(['SUPER_ADMIN']), userController.toggleUserStatus);

// Student user lifecycle management (ADMIN / SUPER_ADMIN)
router.post('/students', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), createStudentValidator, validationHandler, userController.createStudent);
router.get('/students', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), userController.listStudents);
router.put('/students/:id', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), userController.updateStudent);
router.patch('/students/:id/toggle', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), userController.toggleUserStatus);

// Common: Reset credentials (ADMIN / SUPER_ADMIN)
router.post('/:id/reset-password', roleMiddleware(['ADMIN', 'SUPER_ADMIN']), userController.resetUserPassword);

module.exports = router;
