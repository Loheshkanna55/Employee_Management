const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Login page
router.get('/login', authController.getLoginPage);

// Register page
router.get('/register', authController.getRegisterPage);

// Process login
router.post('/login', authController.login);

// Process register
router.post('/register', authController.register);

// Logout
router.get('/logout', authController.logout);

module.exports = router;