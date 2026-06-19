const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');
const validationHandler = require('../middleware/validationHandler');
const {
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', rateLimiter, loginValidator, validationHandler, authController.login);

router.post('/change-password', authMiddleware, changePasswordValidator, validationHandler, authController.changePassword);

router.post('/forgot-password', rateLimiter, forgotPasswordValidator, validationHandler, authController.forgotPassword);

router.post('/reset-password', rateLimiter, resetPasswordValidator, validationHandler, authController.resetPassword);

router.post('/logout', authMiddleware, authController.logout);

router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
