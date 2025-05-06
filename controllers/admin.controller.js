const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../models/user.model');
const Attendance = require('../models/attendance.model');
const Leave = require('../models/leave.model');
const Salary = require('../models/salary.model');

// Get admin dashboard
const getDashboard = async (req, res) => {
  try {
    // Count employees
    const employeeCount = await User.countDocuments({ role: 'employee' });
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count today's attendance
    const todayAttendanceCount = await Attendance.countDocuments({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // Count pending leave applications
    const pendingLeaveCount = await Leave.countDocuments({ status: 'pending' });
    
    // Get recent leave applications
    const recentLeaves = await Leave.find()
      .populate('employee', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get today's attendance
    const todayAttendance = await Attendance.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('employee', 'name email');
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      employeeCount,
      todayAttendanceCount,
      pendingLeaveCount,
      recentLeaves,
      todayAttendance,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/auth/login');
  }
};

// Get all employees
const getEmployees = async (req, res) => {
  try {
    // Get all employees
    const employees = await User.find({ role: 'employee' })
      .sort({ createdAt: -1 });
    
    res.render('admin/employee-list', {
      title: 'All Employees',
      employees,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading employees');
    res.redirect('/admin/dashboard');
  }
};

// Get add employee form
const getAddEmployeeForm = (req, res) => {
  res.render('admin/employee-add', {
    title: 'Add New Employee'
  });
};

// Add new employee
const addEmployee = async (req, res) => {
  try {
    const { name, email, password, department, position, contactNumber, address } = req.body;
    
    // Validation
    if (!name || !email || !password || !department) {
      req.flash('error_msg', 'Please fill all required fields');
      return res.redirect('/admin/employees/add');
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'Email already exists');
      return res.redirect('/admin/employees/add');
    }
    
    // Create new employee
    const newEmployee = new User({
      name,
      email,
      password,
      department,
      position: position || 'Staff',
      contactNumber: contactNumber || '',
      address: address || '',
      role: 'employee'
    });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    newEmployee.password = await bcrypt.hash(password, salt);
    
    await newEmployee.save();
    
    req.flash('success_msg', 'Employee added successfully');
    res.redirect('/admin/employees');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error adding employee');
    res.redirect('/admin/employees/add');
  }
};

// Get employee details
const getEmployeeDetails = async (req, res) => {
  try {
    const employeeId = req.params.id;
    
    // Get employee
    const employee = await User.findById(employeeId);
    
    if (!employee || employee.role !== 'employee') {
      req.flash('error_msg', 'Employee not found');
      return res.redirect('/admin/employees');
    }
    
    // Get attendance count
    const attendanceCount = await Attendance.countDocuments({
      employee: employeeId
    });
    
    // Get leave count
    const leaveCount = await Leave.countDocuments({
      employee: employeeId
    });
    
    // Get salary count
    const salaryCount = await Salary.countDocuments({
      employee: employeeId
    });
    
    res.render('admin/employee-details', {
      title: 'Employee Details',
      employee,
      attendanceCount,
      leaveCount,
      salaryCount,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading employee details');
    res.redirect('/admin/employees');
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { name, department, position, contactNumber, address } = req.body;
    
    // Update employee
    await User.findByIdAndUpdate(employeeId, {
      name,
      department,
      position,
      contactNumber,
      address
    });
    
    req.flash('success_msg', 'Employee updated successfully');
    res.redirect(`/admin/employees/${employeeId}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating employee');
    res.redirect(`/admin/employees/${req.params.id}`);
  }
};
const getEditEmployeeForm = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    res.render('admin/edit-employee', { employee });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading edit form');
    res.render('admin/edit-employee', {
      title: 'Edit Employee',
      employee
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    
    // Delete employee
    await User.findByIdAndDelete(employeeId);
    
    // Delete associated data
    await Attendance.deleteMany({ employee: employeeId });
    await Leave.deleteMany({ employee: employeeId });
    await Salary.deleteMany({ employee: employeeId });
    
    req.flash('success_msg', 'Employee deleted successfully');
    res.redirect('/admin/employees');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error deleting employee');
    res.redirect('/admin/employees');
  }
};

// Get all attendance
const getAttendance = async (req, res) => {
  try {
    // Get date filter
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0, 0, 0, 0);
    
    // Get attendance for date
    const attendance = await Attendance.find({
      date: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('employee', 'name email department');
    
    // Get employees who haven't checked in
    const checkedInEmployeeIds = attendance.map(a => a.employee._id.toString());
    const absentEmployees = await User.find({
      _id: { $nin: checkedInEmployeeIds },
      role: 'employee'
    });
    
    res.render('admin/attendance', {
      title: 'Attendance Management',
      attendance,
      absentEmployees,
      selectedDate: date,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading attendance');
    res.redirect('/admin/dashboard');
  }
};

// Get employee attendance
const getEmployeeAttendance = async (req, res) => {
  try {
    const employeeId = req.params.id;
    
    // Get employee
    const employee = await User.findById(employeeId);
    
    if (!employee || employee.role !== 'employee') {
      req.flash('error_msg', 'Employee not found');
      return res.redirect('/admin/attendance');
    }
    
    // Get month and year from query
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    // Get start and end date of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Get attendance for month
    const attendanceData = await Attendance.find({
      employee: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
    
    res.render('admin/employee-attendance', {
      title: `${employee.name}'s Attendance`,
      employee,
      attendanceData,
      month,
      year,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading employee attendance');
    res.redirect('/admin/attendance');
  }
};

// Get all leave applications
const getLeaveApplications = async (req, res) => {
  try {
    // Get status filter
    const status = req.query.status || 'all';
    
    // Build query
    const query = status === 'all' ? {} : { status };
    
    // Get leave applications
    const leaveApplications = await Leave.find(query)
      .populate('employee', 'name email department')
      .sort({ createdAt: -1 });
    
    res.render('admin/leave-list', {
      title: 'Leave Applications',
      leaveApplications,
      selectedStatus: status,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading leave applications');
    res.redirect('/admin/dashboard');
  }
};

// Get leave details
const getLeaveDetails = async (req, res) => {
  try {
    const leaveId = req.params.id;
    
    // Get leave application
    const leave = await Leave.findById(leaveId)
      .populate('employee', 'name email department position')
      .populate('reviewedBy', 'name');
    
    if (!leave) {
      req.flash('error_msg', 'Leave application not found');
      return res.redirect('/admin/leave');
    }
    
    res.render('admin/leave-details', {
      title: 'Leave Application Details',
      leave,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading leave details');
    res.redirect('/admin/leave');
  }
};

// Approve leave
const approveLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const { remarks } = req.body;
    
    // Update leave application
    await Leave.findByIdAndUpdate(leaveId, {
      status: 'approved',
      adminRemarks: remarks || 'Approved',
      reviewedBy: req.session.user.id,
      reviewedAt: new Date()
    });
    
    req.flash('success_msg', 'Leave application approved');
    res.redirect('/admin/leave');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error approving leave');
    res.redirect(`/admin/leave/${req.params.id}`);
  }
};

// Reject leave
const rejectLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const { remarks } = req.body;
    
    if (!remarks) {
      req.flash('error_msg', 'Please provide rejection reason');
      return res.redirect(`/admin/leave/${leaveId}`);
    }
    
    // Update leave application
    await Leave.findByIdAndUpdate(leaveId, {
      status: 'rejected',
      adminRemarks: remarks,
      reviewedBy: req.session.user.id,
      reviewedAt: new Date()
    });
    
    req.flash('success_msg', 'Leave application rejected');
    res.redirect('/admin/leave');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error rejecting leave');
    res.redirect(`/admin/leave/${req.params.id}`);
  }
};

// Get all salary records
const getSalary = async (req, res) => {
  try {
    // Get month and year filter
    const month = req.query.month || '';
    const year = req.query.year || new Date().getFullYear();
    
    // Build query
    const query = {};
    if (month) {
      query.month = month;
    }
    if (year) {
      query.year = parseInt(year);
    }
    
    // Get salary records
    const salaries = await Salary.find(query)
      .populate('employee', 'name email department')
      .sort({ year: -1, month: -1 });
    
    // Get employees without salary for this period
    let employeesWithoutSalary = [];
    if (month && year) {
      const employeesWithSalary = salaries.map(s => s.employee._id.toString());
      employeesWithoutSalary = await User.find({
        _id: { $nin: employeesWithSalary },
        role: 'employee'
      });
    }
    
    res.render('admin/salary-list', {
      title: 'Salary Management',
      salaries,
      employeesWithoutSalary,
      selectedMonth: month,
      selectedYear: year,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading salary records');
    res.redirect('/admin/dashboard');
  }
};

// Get allocate salary form
const getAllocateSalaryForm = async (req, res) => {
  try {
    const employeeId = req.query.employee;
    
    // Get employee
    const employee = await User.findById(employeeId);
    
    if (!employee || employee.role !== 'employee') {
      req.flash('error_msg', 'Employee not found');
      return res.redirect('/admin/salary');
    }
    
    // Get month and year from query
    const month = req.query.month;
    const year = parseInt(req.query.year);
    
    // Check if salary already exists
    const existingSalary = await Salary.findOne({
      employee: employeeId,
      month,
      year
    });
    
    if (existingSalary) {
      req.flash('error_msg', 'Salary record already exists for this period');
      return res.redirect('/admin/salary');
    }
    
    // Get attendance for month
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);
    
    const attendanceCount = await Attendance.countDocuments({
      employee: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    res.render('admin/salary-allocate', {
      title: 'Allocate Salary',
      employee,
      month,
      year,
      attendanceCount,
      workingDays: endDate.getDate()
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading salary form');
    res.redirect('/admin/salary');
  }
};

// Allocate salary
const allocateSalary = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
      baseSalary,
      deductionReason,
      deductionAmount,
      bonusReason,
      bonusAmount
    } = req.body;
    
    // Validation
    if (!employeeId || !month || !year || !baseSalary) {
      req.flash('error_msg', 'Please fill all required fields');
      return res.redirect('/admin/salary');
    }
    
    // Process deductions
    const deductions = [];
    let totalDeductions = 0;
    
    if (Array.isArray(deductionReason)) {
      for (let i = 0; i < deductionReason.length; i++) {
        if (deductionReason[i] && deductionAmount[i]) {
          const amount = parseFloat(deductionAmount[i]);
          deductions.push({
            reason: deductionReason[i],
            amount
          });
          totalDeductions += amount;
        }
      }
    } else if (deductionReason && deductionAmount) {
      const amount = parseFloat(deductionAmount);
      deductions.push({
        reason: deductionReason,
        amount
      });
      totalDeductions += amount;
    }
    
    // Process bonuses
    const bonuses = [];
    let totalBonuses = 0;
    
    if (Array.isArray(bonusReason)) {
      for (let i = 0; i < bonusReason.length; i++) {
        if (bonusReason[i] && bonusAmount[i]) {
          const amount = parseFloat(bonusAmount[i]);
          bonuses.push({
            reason: bonusReason[i],
            amount
          });
          totalBonuses += amount;
        }
      }
    } else if (bonusReason && bonusAmount) {
      const amount = parseFloat(bonusAmount);
      bonuses.push({
        reason: bonusReason,
        amount
      });
      totalBonuses += amount;
    }
    
    // Calculate net salary
    const base = parseFloat(baseSalary);
    const netSalary = base - totalDeductions + totalBonuses;
    
    // Create salary record
    const salary = new Salary({
      employee: employeeId,
      month,
      year: parseInt(year),
      baseSalary: base,
      deductions,
      bonuses,
      totalDeductions,
      totalBonuses,
      netSalary,
      status: 'pending'
    });
    
    await salary.save();
    
    req.flash('success_msg', 'Salary allocated successfully');
    res.redirect('/admin/salary');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error allocating salary');
    res.redirect('/admin/salary');
  }
};

// Get salary details
const getSalaryDetails = async (req, res) => {
  try {
    const salaryId = req.params.id;
    
    // Get salary record
    const salary = await Salary.findById(salaryId)
      .populate('employee', 'name email department position');
    
    if (!salary) {
      req.flash('error_msg', 'Salary record not found');
      return res.redirect('/admin/salary');
    }
    
    res.render('admin/salary-details', {
      title: 'Salary Details',
      salary,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading salary details');
    res.redirect('/admin/salary');
  }
};

// Update salary
const updateSalary = async (req, res) => {
  try {
    const salaryId = req.params.id;
    const { status, paymentDate, remarks } = req.body;
    
    // Update salary record
    await Salary.findByIdAndUpdate(salaryId, {
      status,
      paymentDate: status === 'paid' ? new Date(paymentDate) : null,
      remarks
    });
    
    req.flash('success_msg', 'Salary record updated successfully');
    res.redirect(`/admin/salary/${salaryId}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating salary record');
    res.redirect(`/admin/salary/${req.params.id}`);
  }
};

module.exports = {
  getDashboard,
  getEmployees,
  getAddEmployeeForm,
  addEmployee,
  getEmployeeDetails,
  updateEmployee,
  deleteEmployee,
  getAttendance,
  getEmployeeAttendance,
  getLeaveApplications,
  getLeaveDetails,
  approveLeave,
  rejectLeave,
  getSalary,
  getAllocateSalaryForm,
  allocateSalary,
  getSalaryDetails,
  updateSalary,
  getEditEmployeeForm
};