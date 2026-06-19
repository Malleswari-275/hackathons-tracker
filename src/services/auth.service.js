const bcrypt = require('bcrypt');
const User = require('../models/User');
const SuperAdminProfile = require('../models/SuperAdminProfile');
const MentorProfile = require('../models/MentorProfile');
const StudentProfile = require('../models/StudentProfile');
const { generateToken } = require('../utils/helpers');
const { sendEmail } = require('../config/mailer');

const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (user.status === 'BLOCKED') {
    throw new Error('Your account has been blocked. Contact support.');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Load profile details based on role
  let profile = null;
  if (user.role === 'SUPER_ADMIN') {
    profile = await SuperAdminProfile.findOne({ userId: user._id });
  } else if (user.role === 'ADMIN') {
    profile = await MentorProfile.findOne({ userId: user._id });
  } else if (user.role === 'STUDENT') {
    profile = await StudentProfile.findOne({ userId: user._id });
  }

  // Generate Token
  const token = generateToken({ id: user._id, role: user.role });

  return {
    token,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      forcePasswordChange: user.forcePasswordChange,
      lastLoginAt: user.lastLoginAt
    },
    profile
  };
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error('Incorrect current password');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  user.forcePasswordChange = false;
  user.passwordChangedAt = new Date();

  await user.save();
  return { success: true };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return success to prevent email enumeration
    return { success: true };
  }

  // Generate a temporary reset token (for simplicity we can sign a short-lived token or mock a token)
  const resetToken = generateToken({ id: user._id, action: 'RESET_PASSWORD' });

  // Send mail
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Please use the following token: \n\n${resetToken}\n\nThis token expires in 1 hour.`,
    html: `<p>You requested a password reset. Please use the following token to reset your password:</p><p><code>${resetToken}</code></p>`
  });

  return { success: true };
};

const resetPassword = async (token, newPassword) => {
  const jwt = require('jsonwebtoken');
  const env = require('../config/env');

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired password reset token');
  }

  if (decoded.action !== 'RESET_PASSWORD') {
    throw new Error('Invalid token type');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error('User not found');
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  user.forcePasswordChange = false;
  user.passwordChangedAt = new Date();

  await user.save();
  return { success: true };
};

module.exports = {
  login,
  changePassword,
  forgotPassword,
  resetPassword
};
