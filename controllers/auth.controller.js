const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// GET Login Page
const getLoginPage = (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/employee/dashboard');
    }
  }

  res.render('auth/login', {
    title: 'Login',
    layout: 'layouts/auth'
  });
};

// GET Register Page
const getRegisterPage = (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/employee/dashboard');
    }
  }

  res.render('auth/register', {
    title: 'Register',
    layout: 'layouts/auth',
    success_msg: req.flash('success_msg'),
    error_msg: req.flash('error_msg')
  });
  
};

// POST Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      req.flash('error_msg', 'Please fill in all fields');
      return res.redirect('/auth/login');
    }

    // Check user existence
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'User does not exist');
      return res.redirect('/auth/login');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Password is incorrect');
      return res.redirect('/auth/login');
    }

    // Set session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };

    req.flash('success_msg', 'You are now logged in');

    // Redirect by role
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/employee/dashboard');
    }
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Something went wrong');
    res.redirect('/auth/login');
  }
};

// POST Register
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      department,
      contactNumber,
      address
    } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword || !department || !contactNumber || !address) {
      req.flash('error_msg', 'Please fill in all fields');
      return res.redirect('/auth/register');
    }

    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect('/auth/register');
    }

    if (password.length < 6) {
      req.flash('error_msg', 'Password should be at least 6 characters');
      return res.redirect('/auth/register');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'Email already exists');
      return res.redirect('/auth/register');
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      department,
      contactNumber,
      address,
      role: 'employee'
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    await newUser.save();

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Something went wrong');
    res.redirect('/auth/register');
  }
};

// GET Logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/auth/login');
  });
};

module.exports = {
  getLoginPage,
  getRegisterPage,
  login,
  register,
  logout
};
