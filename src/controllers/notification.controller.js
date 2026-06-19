const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/helpers');

const getNotifications = async (req, res, next) => {
  try {
    const list = await notificationService.getNotifications(req.user._id);
    return sendSuccess(res, 'Notifications loaded successfully', list);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    return sendSuccess(res, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
