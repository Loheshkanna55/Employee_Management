const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { employeeMiddleware } = require('../middleware/auth.middleware');

// Apply middleware to all routes
router.use(employeeMiddleware);

// Dashboard
router.get('/dashboard', employeeController.getDashboard);

// Profile
router.get('/profile', employeeController.getProfile);
router.post('/profile', employeeController.updateProfile);

// Attendance
router.get('/attendance', employeeController.getAttendance);
router.post('/attendance/check-in', employeeController.checkIn);
router.post('/attendance/check-out', employeeController.checkOut);
router.get('/attendance/history', employeeController.getAttendanceHistory);

// Leave
router.get('/leave', employeeController.getLeaveApplications);
router.get('/leave/apply', employeeController.getApplyLeaveForm);
router.post('/leave/apply', employeeController.applyLeave);
router.get('/leave/:id', employeeController.getLeaveDetails);

// Salary
router.get('/salary', employeeController.getSalary);
router.get('/salary/:id', employeeController.getSalaryDetails);

module.exports = router;