const User = require('../models/user.model');

// Check if user is authenticated
const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error_msg', 'Please log in to access this page');
    return res.redirect('/auth/login');
  }
  next();
};

// Check if user is admin
const adminMiddleware = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.flash('error_msg', 'Access denied. Admins only');
    return res.redirect('/employee/dashboard');
  }
  next();
};

// Check if user is employee
const employeeMiddleware = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'employee') {
    req.flash('error_msg', 'Access denied');
    return res.redirect('/admin/dashboard');
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  employeeMiddleware
};