const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const createAdmin = async () => {
  try {
    // Check if admin already exists (better check by email)
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });

    if (adminExists) {
      console.log('Admin already exists');
      return; 
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin
    await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      department: 'Administration',
      contactNumber: '6382027313',
      address: '123 Admin Street, Head Office'
    });

    console.log('Admin created successfully');

  } catch (err) {
    console.error('Error creating admin:', err);

  }
};

module.exports = createAdmin;
