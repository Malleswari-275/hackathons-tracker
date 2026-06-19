const Notification = require('../models/Notification');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { sendEmail } = require('../config/mailer');
const {
  getCompetitionApprovedEmail,
  getCompetitionRejectedEmail,
  getCompetitionAssignedEmail,
  getDeadlineReminderEmail
} = require('../templates/emailTemplates');

const createNotification = async (data) => {
  const notification = await Notification.create({
    recipientId: data.recipientId,
    competitionId: data.competitionId,
    type: data.type,
    title: data.title,
    message: data.message,
    channels: data.channels || ['portal'],
    delivery: {
      emailSent: false,
      emailSentAt: null
    },
    read: false
  });

  // Handle email send if configured in channels
  if (data.channels && data.channels.includes('email') && data.emailBody) {
    const recipient = await User.findById(data.recipientId);
    if (recipient) {
      const info = await sendEmail({
        to: recipient.email,
        subject: data.emailBody.subject,
        text: data.emailBody.text,
        html: data.emailBody.html
      });

      if (info) {
        notification.delivery.emailSent = true;
        notification.delivery.emailSentAt = new Date();
        await notification.save();
      }
    }
  }

  return notification;
};

// Dispatch logic based on events
const triggerNotification = async (type, payload) => {
  const { competitionId, title, message, eligibility, recipientId, recipientIds, reason } = payload;

  if (type === 'EVENT_APPROVED') {
    // Send email to competition owner
    const compOwnerId = recipientId;
    const emailBody = getCompetitionApprovedEmail(title, payload.organization);
    await createNotification({
      recipientId: compOwnerId,
      competitionId,
      type,
      title,
      message,
      channels: ['portal', 'email'],
      emailBody
    });
  }

  else if (type === 'EVENT_REJECTED') {
    const compOwnerId = recipientId;
    const emailBody = getCompetitionRejectedEmail(title, payload.organization, reason);
    await createNotification({
      recipientId: compOwnerId,
      competitionId,
      type,
      title,
      message,
      channels: ['portal', 'email'],
      emailBody
    });
  }

  else if (type === 'EVENT_ASSIGNED') {
    const list = Array.isArray(recipientIds) ? recipientIds : [recipientId];
    const emailBody = getCompetitionAssignedEmail(title, payload.roleName || 'MENTOR/STUDENT');
    for (const rId of list) {
      await createNotification({
        recipientId: rId,
        competitionId,
        type,
        title,
        message,
        channels: ['portal', 'email'],
        emailBody
      });
    }
  }

  else if (type === 'ELIGIBLE_EVENT') {
    // Find students matching eligibility
    const query = {};
    if (eligibility) {
      if (eligibility.departments && eligibility.departments.length > 0) {
        query.department = { $in: eligibility.departments };
      }
      if (eligibility.years && eligibility.years.length > 0) {
        query.year = { $in: eligibility.years };
      }
      if (eligibility.skills && eligibility.skills.length > 0) {
        query.skills = { $in: eligibility.skills };
      }
    }

    const students = await StudentProfile.find(query).select('userId name');
    for (const student of students) {
      const emailBody = {
        subject: `New Opportunity Eligible: ${title}`,
        text: `Hello ${student.name},\n\nYou are eligible for the newly published competition "${title}". Login to the portal to view details and register.\n\nRegards,\nPortal Team`,
        html: `<p>Hello ${student.name},</p><p>You are eligible for the newly published competition <strong>"${title}"</strong>.</p><p>Login to the portal to view details and register.</p>`
      };

      await createNotification({
        recipientId: student.userId,
        competitionId,
        type: 'ELIGIBLE_EVENT',
        title: `Opportunity: ${title}`,
        message: `You are eligible to participate in ${title}`,
        channels: ['portal', 'email'],
        emailBody
      });
    }
  }

  else if (type === 'DEADLINE_REMINDER') {
    const list = Array.isArray(recipientIds) ? recipientIds : [recipientId];
    const emailBody = getDeadlineReminderEmail(title, payload.deadline);
    for (const rId of list) {
      await createNotification({
        recipientId: rId,
        competitionId,
        type,
        title,
        message,
        channels: ['portal', 'email'],
        emailBody
      });
    }
  }

  else if (type === 'EVENT_STARTS') {
    const list = Array.isArray(recipientIds) ? recipientIds : [recipientId];
    for (const rId of list) {
      await createNotification({
        recipientId: rId,
        competitionId,
        type,
        title,
        message: `The competition "${title}" starts tomorrow. Get ready!`,
        channels: ['portal']
      });
    }
  }
};

const getNotifications = async (userId) => {
  return Notification.find({ recipientId: userId }).sort({ createdAt: -1 });
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, recipientId: userId });
  if (!notification) {
    throw new Error('Notification not found');
  }
  notification.read = true;
  notification.readAt = new Date();
  await notification.save();
  return notification;
};

module.exports = {
  createNotification,
  triggerNotification,
  getNotifications,
  markAsRead
};
