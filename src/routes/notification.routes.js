const express = require('express');
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.patch('/read/:id', notificationController.markAsRead);

module.exports = router;
