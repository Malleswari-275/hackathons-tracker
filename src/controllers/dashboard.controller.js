const dashboardService = require('../services/dashboard.service');
const { sendSuccess, sendError } = require('../utils/helpers');

const getDashboardMetrics = async (req, res, next) => {
  try {
    let metrics = {};

    if (req.user.role === 'SUPER_ADMIN') {
      metrics = await dashboardService.getSuperAdminMetrics();
    } else if (req.user.role === 'ADMIN') {
      metrics = await dashboardService.getAdminMetrics(req.user._id);
    } else if (req.user.role === 'STUDENT') {
      metrics = await dashboardService.getStudentMetrics(req.user._id);
    } else {
      return sendError(res, 'Invalid user role', 400);
    }

    return sendSuccess(res, 'Dashboard metrics retrieved successfully', metrics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics
};
