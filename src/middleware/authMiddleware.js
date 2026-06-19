const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check Cookies (if cookie-parser is used)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: No Token Provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Get user from DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: User Not Found'
      });
    }

    // Check account status
    if (user.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Your account has been BLOCKED'
      });
    }

    // Force password change check
    // Allow password change endpoint and logout endpoints without blocking
    const isPasswordChangeOrLogout =
      req.path === '/change-password' || req.path === '/logout';

    if (user.forcePasswordChange && !isPasswordChangeOrLogout) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Password change required',
        forcePasswordChange: true
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid or Expired Token'
    });
  }
};

module.exports = authMiddleware;
