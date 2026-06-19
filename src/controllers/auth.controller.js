const authService = require('../services/auth.service');
const profileService = require('../services/profile.service');
const { sendSuccess, sendError } = require('../utils/helpers');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Set secure HTTP-only cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return sendSuccess(res, 'Login successful', {
      user: result.user,
      profile: result.profile,
      token: result.token
    });
  } catch (error) {
    return sendError(res, error.message, 401);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user._id, oldPassword, newPassword);
    return sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    return sendSuccess(res, 'If this email exists in our records, a password reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    return sendSuccess(res, 'Password reset successful');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    return sendSuccess(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user._id, req.user.role);
    return sendSuccess(res, 'Current user loaded successfully', {
      user: {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        forcePasswordChange: req.user.forcePasswordChange,
        lastLoginAt: req.user.lastLoginAt
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  getMe
};
