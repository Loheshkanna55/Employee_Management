const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const adminRoutes = require('./routes/admin.routes');
const { authMiddleware } = require('./middleware/auth.middleware');

// Initialize app
const app = express();
// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/employee-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected');
    createAdmin();   
.catch(err => console.log(err));

// EJS setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(session({
  secret: 'employee-management-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.session.user || null;
  res.locals.path = req.path; // Add path to locals
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('home', {
    title: 'Employee Management System',
    layout: 'layouts/landing',
    path: req.path
  });
});

app.use('/auth', authRoutes);
app.use('/employee', authMiddleware, employeeRoutes);
app.use('/admin', authMiddleware, adminRoutes);

// 404 route
app.use((req, res) => {
  res.status(404).render('error/404', {
    title: '404 - Page Not Found',
    layout: 'layouts/main',
    path: req.path
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
