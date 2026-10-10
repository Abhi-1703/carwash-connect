const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verifies JWT from Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in first.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'carwash_connect_secret_key_2026_supersecure');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

/**
 * Grant access to specific roles (e.g., provider, customer)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const currentRole = req.user ? req.user.role : 'guest';
      return res.status(403).json({
        success: false,
        message: 'Forbidden: User role ' + currentRole + ' is not authorized to access this route.'
      });
    }
    next();
  };
};

module.exports = { protect, authorize };