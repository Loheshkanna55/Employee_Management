const moment = require('moment');
const User = require('../models/user.model');
const Attendance = require('../models/attendance.model');
const Leave = require('../models/leave.model');
const Salary = require('../models/salary.model');
const Task = require('../models/task.model');

// Get employee dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if employee has checked in today
    const todayAttendance = await Attendance.findOne({
      employee: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // Get pending leave applications
    const pendingLeaves = await Leave.find({
      employee: userId,
      status: 'pending'
    }).sort({ createdAt: -1 }).limit(5);
    
    // Get latest salary
    const latestSalary = await Salary.findOne({
      employee: userId
    }).sort({ year: -1, month: -1 }).limit(1);
    
    res.render('employee/dashboard', {
      title: 'Employee Dashboard',
      todayAttendance,
      pendingLeaves,
      latestSalary,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/auth/login');
  }
};

// Get employee profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/employee/dashboard');
    }
    
    res.render('employee/profile', {
      title: 'My Profile',
      user,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading profile');
    res.redirect('/employee/dashboard');
  }
};

// Update employee profile
const updateProfile = async (req, res) => {
  try {
    const { name, contactNumber, address } = req.body;
    
    // Update user
    await User.findByIdAndUpdate(req.session.user.id, {
      name,
      contactNumber,
      address
    });
    
    req.flash('success_msg', 'Profile updated successfully');
    res.redirect('/employee/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating profile');
    res.redirect('/employee/profile');
  }
};

// Get attendance page
const getAttendance = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if employee has checked in today
    const todayAttendance = await Attendance.findOne({
      employee: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // Get recent attendance
    const recentAttendance = await Attendance.find({
      employee: userId
    }).sort({ date: -1 }).limit(10);
    
    res.render('employee/attendance', {
      title: 'Attendance',
      todayAttendance,
      attendances: recentAttendance,  // Pass 'recentAttendance' as 'attendances'
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading attendance');
    res.redirect('/employee/dashboard');
  }
};
// Check in
const checkIn = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if already checked in
    const existingAttendance = await Attendance.findOne({
      employee: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (existingAttendance) {
      req.flash('error_msg', 'You have already checked in today');
      return res.redirect('/employee/attendance');
    }
    
    // Create new attendance
    const attendance = new Attendance({
      employee: userId,
      checkIn: new Date(),
      status: 'present'
    });
    
    await attendance.save();
    
    req.flash('success_msg', 'Checked in successfully');
    res.redirect('/employee/attendance');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error checking in');
    res.redirect('/employee/attendance');
  }
};

// Check out
const checkOut = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance
    const attendance = await Attendance.findOne({
      employee: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!attendance) {
      req.flash('error_msg', 'You have not checked in today');
      return res.redirect('/employee/attendance');
    }
    
    if (attendance.checkOut) {
      req.flash('error_msg', 'You have already checked out today');
      return res.redirect('/employee/attendance');
    }
    
    // Update attendance
    const checkOut = new Date();
    const workingHours = (checkOut - attendance.checkIn) / (1000 * 60 * 60);
    
    attendance.checkOut = checkOut;
    attendance.workingHours = parseFloat(workingHours.toFixed(2));
    
    await attendance.save();
    
    req.flash('success_msg', 'Checked out successfully');
    res.redirect('/employee/attendance');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error checking out');
    res.redirect('/employee/attendance');
  }
};

// Get attendance history
const getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get month and year from query
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    // Get start and end date of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Get attendance for month
    const attendanceData = await Attendance.find({
      employee: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
    
    res.render('employee/attendance', {
      title: 'My Attendance',
      attendances: attendanceData, // ✅ use 'attendances' to match EJS variable
      moment
    });
    
    
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading attendance history');
    res.redirect('/employee/attendance');
  }
};

// Get leave applications
const getLeaveApplications = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get leave applications
    const leaveApplications = await Leave.find({
      employee: userId
    }).sort({ createdAt: -1 });
    
    res.render('employee/leave-list', {
      title: 'Leave Applications',
      leaveApplications,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading leave applications');
    res.redirect('/employee/dashboard');
  }
};

// Get apply leave form
// Get apply leave form
const getApplyLeaveForm = (req, res) => {
  res.render('employee/leave-apply', {
    title: 'Apply for Leave',
    error_msg: req.flash('error_msg'),
    success_msg: req.flash('success_msg')
  });
};


// Apply leave
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const userId = req.session.user.id;
    
    // Validation
    if (!leaveType || !startDate || !endDate || !reason) {
      req.flash('error_msg', 'Please fill in all fields');
      return res.redirect('/employee/leave/apply');
    }
    
    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      req.flash('error_msg', 'End date must be after start date');
      return res.redirect('/employee/leave/apply');
    }
    
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Create new leave application
    const leave = new Leave({
      employee: userId,
      leaveType,
      startDate: start,
      endDate: end,
      duration,
      reason
    });
    
    await leave.save();
    
    req.flash('success_msg', 'Leave application submitted successfully');
    res.redirect('/employee/leave');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error applying for leave');
    res.redirect('/employee/leave/apply');
  }
};

// Get leave details
const getLeaveDetails = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const userId = req.session.user.id;
    
    // Get leave application
    const leave = await Leave.findOne({
      _id: leaveId,
      employee: userId
    }).populate('reviewedBy', 'name');
    
    if (!leave) {
      req.flash('error_msg', 'Leave application not found');
      return res.redirect('/employee/leave');
    }
    
    res.render('employee/leave-details', {
      title: 'Leave Details',
      leave,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading leave details');
    res.redirect('/employee/leave');
  }
};

// Get salary
const getSalary = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get all salary records
    const salaries = await Salary.find({
      employee: userId
    }).sort({ year: -1, month: -1 });
    
    res.render('employee/salary-list', {
      title: 'My Salary',
      salaries,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading salary details');
    res.redirect('/employee/dashboard');
  }
};

// Get salary details
const getSalaryDetails = async (req, res) => {
  try {
    const salaryId = req.params.id;
    const userId = req.session.user.id;
    
    // Get salary record
    const salary = await Salary.findOne({
      _id: salaryId,
      employee: userId
    });
    
    if (!salary) {
      req.flash('error_msg', 'Salary record not found');
      return res.redirect('/employee/salary');
    }
    
    res.render('employee/salary-details', {
      title: 'Salary Details',
      salary,
      moment
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading salary details');
    res.redirect('/employee/salary');
  }
};


const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.session.user.id });
    res.render('employee/tasks', { title: 'My Tasks', tasks });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading tasks');
    res.redirect('/employee/dashboard');
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getAttendance,
  checkIn,
  checkOut,
  getAttendanceHistory,
  getLeaveApplications,
  getApplyLeaveForm,
  applyLeave,
  getLeaveDetails,
  getSalary,
  getSalaryDetails,
  getMyTasks
};