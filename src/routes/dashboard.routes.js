const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', authMiddleware, dashboardController.getDashboardMetrics);

module.exports = router;
