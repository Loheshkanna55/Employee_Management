const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminMiddleware } = require('../middleware/auth.middleware');

// Apply middleware to all routes
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Employees
router.get('/employees', adminController.getEmployees);
router.get('/employees/add', adminController.getAddEmployeeForm);
router.post('/employees/add', adminController.addEmployee);
router.get('/employees/:id', adminController.getEmployeeDetails);
router.post('/employees/:id', adminController.updateEmployee);
router.delete('/employees/:id', adminController.deleteEmployee);
router.get('/employees/:id/edit', adminController.getEditEmployeeForm);

// Attendance
router.get('/attendance', adminController.getAttendance);
router.get('/attendance/:id', adminController.getEmployeeAttendance);

// Leave
router.get('/leave', adminController.getLeaveApplications);
router.get('/leave/:id', adminController.getLeaveDetails);
router.post('/leave/:id/approve', adminController.approveLeave);
router.post('/leave/:id/reject', adminController.rejectLeave);

// Salary
router.get('/salary', adminController.getSalary);
router.get('/salary/allocate', adminController.getAllocateSalaryForm);
router.post('/salary/allocate', adminController.allocateSalary);
router.get('/salary/:id', adminController.getSalaryDetails);
router.put('/salary/:id', adminController.updateSalary);

module.exports = router;