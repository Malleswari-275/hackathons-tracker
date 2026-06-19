const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const profileRoutes = require('./profile.routes');
const competitionRoutes = require('./competition.routes');
const assignmentRoutes = require('./assignment.routes');
const registrationRoutes = require('./registration.routes');
const notificationRoutes = require('./notification.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/competitions', competitionRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/registrations', registrationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
